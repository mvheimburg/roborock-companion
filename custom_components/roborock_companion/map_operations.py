"""Validated map changes using the existing HA RPC trait and library features."""

import asyncio

from .adapter import AdapterError, UnconfirmedError


def integer(value, minimum=0, maximum=51200):
    if type(value) is not int or not minimum <= value <= maximum:
        raise AdapterError("invalid_coordinates")
    return value


def coordinates(values, count):
    if not isinstance(values, list) or len(values) != count:
        raise AdapterError("invalid_coordinates")
    return [integer(v) for v in values]


def _canonical(items):
    return sorted(tuple(v) for v in items)


async def async_map_operation(ops, operation, params, request_id, completed):
    adapter = ops.adapter
    before = adapter.get_snapshot()
    target = integer(params.get("map_id"), 0, 255)
    current = next((m for m in before["maps"] if m["id"] == target and m["active"]), None)
    if current is None or before["state"] not in ("docked", "idle"):
        raise AdapterError("wrong_map_or_busy")
    capability = before["capabilities"].get(operation, {})
    if capability.get("status") != "available":
        raise AdapterError(capability.get("reason") or "model_unverified")
    rooms = {r["id"] for r in current["rooms"]}
    if operation == "map_restrictions_save":
        if set(params) != {"map_id", "walls", "no_go"}:
            raise AdapterError("invalid_request")
        walls = [coordinates(w, 4) for w in params["walls"]]
        zones = [coordinates(z, 8) for z in params["no_go"]]
        if len(walls) * 2 + len(zones) * 4 > 68:
            raise AdapterError("too_many_restrictions")
        method, data = (
            "save_map",
            [[1, *w] for w in walls] + [[0, *z] for z in zones] + [[100, target]],
        )
    elif operation == "room_split":
        if set(params) != {"map_id", "room_id", "line"} or params["room_id"] not in rooms:
            raise AdapterError("invalid_room")
        line = coordinates(params["line"], 4)
        if line[:2] == line[2:]:
            raise AdapterError("invalid_coordinates")
        method, data = "split_segment", [integer(params["room_id"], 1, 255), *line]
    elif operation == "room_merge":
        selected = params.get("rooms")
        if (
            set(params) != {"map_id", "rooms"}
            or not isinstance(selected, list)
            or len(selected) != 2
            or len(set(selected)) != 2
            or not set(selected) <= rooms
        ):
            raise AdapterError("invalid_room")
        method, data = "merge_segment", [integer(r, 1, 255) for r in selected]
    elif operation == "floor_material":
        if (
            set(params) != {"map_id", "room_id", "material", "direction"}
            or params["room_id"] not in rooms
        ):
            raise AdapterError("invalid_room")
        method = "set_segment_ground_material"
        data = [
            [
                integer(params["room_id"], 1, 255),
                integer(params["material"], 0, 4),
                integer(params["direction"], -1, 359),
            ]
        ]
    elif operation in ("map_backup", "map_restore"):
        if set(params) != {"map_id", "confirm"} or params["confirm"] is not True:
            raise AdapterError("confirmation_required")
        method = "manual_bak_map" if operation == "map_backup" else "recover_multi_map"
        data = {"map_flag": target}
    elif operation == "map_build":
        if set(params) != {"map_id", "confirm"} or params["confirm"] is not True:
            raise AdapterError("confirmation_required")
        method, data = "app_start_build_map", []
    else:
        raise AdapterError("unsupported_operation")
    generation = adapter.generation
    editing = method in (
        "save_map",
        "split_segment",
        "merge_segment",
        "set_segment_ground_material",
    )
    retry_format = getattr(
        adapter.coordinator.properties_api.device_features, "is_rpc_retry_supported", False
    )
    if editing and retry_format:
        data = {"data": data, "need_retry": 1}
    elif method == "set_segment_ground_material":
        data = {"data": data}
    opened = False
    try:
        if editing:
            response = await adapter.async_command("start_edit_map", [])
            if response != ["ok"]:
                return ops.result(request_id, "unconfirmed", error="edit_session_unconfirmed")
            opened = True
        adapter.ensure_current()
        if generation != adapter.generation:
            raise AdapterError("binding_changed")
        response = await adapter.async_command(method, data)
        completed.append(method)
        if response not in (["ok"], ["retry"], "ok"):
            return ops.result(
                request_id, "unconfirmed", error="readback_pending", completed=completed
            )
        # A retry acknowledgement is not completion. Observe fresh authoritative geometry.
        if response == ["retry"]:
            await asyncio.sleep(1)
        await adapter.coordinator.properties_api.map_content.refresh()
        adapter.ensure_current()
        after = adapter.get_snapshot()
        updated = next((m for m in after["maps"] if m["id"] == target and m["active"]), None)
        confirmed = bool(
            updated
            and operation == "map_restrictions_save"
            and _canonical(updated["walls"]) == _canonical(walls)
            and _canonical(updated["no_go"]) == _canonical(zones)
        )
        if operation == "room_split" and updated:
            confirmed = len(updated["rooms"]) > len(current["rooms"])
        elif operation == "room_merge" and updated:
            confirmed = len(updated["rooms"]) < len(current["rooms"])
        return ops.result(
            request_id,
            "confirmed" if confirmed else "unconfirmed",
            error=None if confirmed else "readback_pending",
            completed=completed,
        )
    finally:
        if opened and adapter.generation == generation:
            try:
                await adapter.async_command("end_edit_map", [])
            except Exception as err:
                raise UnconfirmedError("edit_session_unconfirmed") from err
