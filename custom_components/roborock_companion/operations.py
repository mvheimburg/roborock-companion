"""Bounded, allowlisted operations through the shared HA connection."""

import asyncio
import hashlib
import json
import re
from collections import OrderedDict

from .adapter import AdapterError, UnconfirmedError


class Operations:
    def __init__(self, adapter):
        self.adapter = adapter
        self.lock = asyncio.Lock()
        self.results = OrderedDict()
        self.pending = set()

    def result(self, request_id, status, *, error=None, completed=None, data=None):
        return {
            "request_id": request_id,
            "status": status,
            "revision": self.adapter.get_snapshot()["revision"],
            "completed_steps": completed or [],
            "error": error,
            "data": data,
        }

    async def async_execute(self, operation, params, expected_revision, request_id, *, is_admin):
        if not is_admin:
            return self.result(request_id, "failed", error="unauthorized")
        if not isinstance(request_id, str) or not re.fullmatch(r"[\w-]{1,80}", request_id):
            return self.result("", "failed", error="invalid_request")
        if not isinstance(params, dict) or len(json.dumps(params)) > 100_000:
            return self.result(request_id, "failed", error="invalid_request")
        fingerprint = hashlib.sha256(
            json.dumps([operation, params, expected_revision], sort_keys=True).encode()
        ).hexdigest()
        if request_id in self.results:
            previous, result = self.results[request_id]
            return (
                result
                if previous == fingerprint
                else self.result(request_id, "failed", error="request_conflict")
            )
        if request_id in self.pending:
            return self.result(request_id, "pending")
        if self.lock.locked():
            return self.result(request_id, "failed", error="busy")
        if expected_revision != self.adapter.get_snapshot()["revision"]:
            return self.result(request_id, "failed", error="conflict")
        if not self.adapter.available:
            return self.result(request_id, "failed", error="unavailable")
        if operation in ("carpets_save", "thresholds_save"):
            return self.result(request_id, "failed", error="preservation_unverified")
        map_operations = {
            "map_restrictions_save",
            "room_split",
            "room_merge",
            "floor_material",
            "map_backup",
            "map_restore",
            "map_build",
        }
        if (
            operation
            not in {
                "schedules_read",
                "settings_save",
                "history_read",
                "map_refresh",
                "room_display_save",
                "map_goto",
                "map_zone_clean",
            }
            | map_operations
        ):
            return self.result(request_id, "failed", error="unsupported_operation")
        if (
            operation == "map_restrictions_save"
            and self.adapter.get_snapshot()["capabilities"][operation]["status"] != "available"
        ):
            return self.result(request_id, "failed", error="preservation_unverified")
        completed = []
        self.pending.add(request_id)
        try:
            async with self.lock, asyncio.timeout(30):
                self.adapter.ensure_current()
                if operation in ("map_goto", "map_zone_clean"):
                    from .map_operations import async_coordinate_action

                    result = await async_coordinate_action(
                        self, operation, params, request_id, completed
                    )
                elif operation == "room_display_save":
                    if set(params) != {"map_id", "room_id", "name"}:
                        raise AdapterError("invalid_request")
                    current = self.adapter.get_snapshot()
                    floor = next((m for m in current["maps"] if m["id"] == params["map_id"]), None)
                    if floor is None or params["room_id"] not in {r["id"] for r in floor["rooms"]}:
                        raise AdapterError("invalid_room")
                    name = params["name"]
                    if not isinstance(name, str) or not 1 <= len(name.strip()) <= 80:
                        raise AdapterError("invalid_setting")
                    entry = getattr(self.adapter, "companion_entry", None)
                    if entry is None:
                        raise AdapterError("invalid_binding")
                    names = dict(entry.options.get("room_names", {}))
                    names[f"{params['map_id']}:{params['room_id']}"] = name.strip()
                    self.adapter.hass.config_entries.async_update_entry(
                        entry, options=dict(entry.options) | {"room_names": names}
                    )
                    result = self.result(request_id, "confirmed")
                elif operation in map_operations:
                    from .map_operations import async_map_operation

                    result = await async_map_operation(
                        self, operation, params, request_id, completed
                    )
                elif operation == "schedules_read":
                    response = await self.adapter.async_command("get_timer", [])
                    if response == ["retry"]:
                        result = self.result(request_id, "unconfirmed", error="robot_retry")
                    elif not isinstance(response, list):
                        result = self.result(request_id, "failed", error="invalid_response")
                    else:
                        self.adapter.extra["schedules"] = response[:64]
                        result = self.result(request_id, "confirmed", data=response[:64])
                elif operation == "settings_save":
                    from .settings import async_save_settings

                    result = await async_save_settings(self, params, request_id, completed)
                elif operation == "history_read":
                    from .readings import async_history

                    result = self.result(
                        request_id, "confirmed", data=await async_history(self.adapter, params)
                    )
                else:
                    from .readings import async_refresh_map

                    await async_refresh_map(self.adapter)
                    result = self.result(request_id, "confirmed")
        except UnconfirmedError as err:
            result = self.result(request_id, "unconfirmed", error=str(err), completed=completed)
        except (AdapterError, ValueError) as err:
            result = self.result(request_id, "failed", error=str(err), completed=completed)
        except TimeoutError:
            result = self.result(request_id, "unconfirmed", error="timeout", completed=completed)
        except Exception:
            # Do not expose RPC parameters, credentials or raw server errors.
            result = self.result(
                request_id, "unconfirmed", error="request_failed", completed=completed
            )
        finally:
            self.pending.discard(request_id)
        self.results[request_id] = (fingerprint, result)
        while len(self.results) > 64:
            self.results.popitem(last=False)
        self.adapter._notify()
        return result
