"""Structured settings using existing HA entities and public services."""

import math
import re

from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from .adapter import AdapterError


def related_entities(adapter):
    registry = er.async_get(adapter.hass)
    robot = registry.async_get(adapter.entity_id)
    if not robot or not robot.device_id:
        return []
    devices = dr.async_get(adapter.hass)
    ids = {robot.device_id} | {
        d.id
        for d in dr.async_entries_for_config_entry(devices, robot.config_entry_id)
        if d.via_device_id == robot.device_id
    }
    return [
        e
        for e in er.async_entries_for_config_entry(registry, robot.config_entry_id)
        if e.device_id in ids
        and e.platform == "roborock"
        and e.config_entry_id == robot.config_entry_id
        and not e.disabled_by
        and not e.hidden_by
    ]


def get_settings(adapter):
    result = []
    for entity in related_entities(adapter):
        domain = entity.domain
        state = adapter.hass.states.get(entity.entity_id)
        if domain not in ("switch", "select", "number", "time", "button") or state is None:
            continue
        attrs = state.attributes
        result.append(
            {
                "entity_id": entity.entity_id,
                "kind": domain,
                "name": state.name,
                "value": state.state == "on" if domain == "switch" else state.state,
                "available": state.state != "unavailable"
                and (domain == "button" or state.state != "unknown"),
                "options": list(attrs.get("options", [])),
                "min": attrs.get("min"),
                "max": attrs.get("max"),
                "step": attrs.get("step", 1),
                "unit": attrs.get("unit_of_measurement"),
            }
        )
    return result


def validate_changes(adapter, params):
    if (
        set(params) != {"changes"}
        or not isinstance(params["changes"], list)
        or not 1 <= len(params["changes"]) <= 32
    ):
        raise AdapterError("invalid_setting")
    fields = {f["entity_id"]: f for f in get_settings(adapter)}
    changes, seen = [], set()
    for change in params["changes"]:
        if not isinstance(change, dict) or set(change) != {"entity_id", "value"}:
            raise AdapterError("invalid_setting")
        key, value = change["entity_id"], change["value"]
        if key not in fields or key in seen or not fields[key]["available"]:
            raise AdapterError("invalid_setting")
        field = fields[key]
        kind = field["kind"]
        if kind == "button":
            raise AdapterError("invalid_setting")
        if kind == "select" and value not in field["options"]:
            raise AdapterError("invalid_setting")
        if kind == "switch" and type(value) is not bool:
            raise AdapterError("invalid_setting")
        if kind == "number":
            if type(value) not in (int, float) or not math.isfinite(value):
                raise AdapterError("invalid_setting")
            if (
                field["min"] is None
                or field["max"] is None
                or not field["min"] <= value <= field["max"]
            ):
                raise AdapterError("invalid_setting")
        if kind == "time" and (
            not isinstance(value, str)
            or not re.fullmatch(r"(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?", value)
        ):
            raise AdapterError("invalid_setting")
        service, data = {
            "select": ("select_option", {"option": value}),
            "switch": ("turn_on" if value else "turn_off", {}),
            "number": ("set_value", {"value": value}),
            "time": ("set_value", {"time": value}),
        }[kind]
        seen.add(key)
        changes.append((field, value, service, data | {"entity_id": key}))
    return changes


async def async_save_settings(operations, params, request_id, completed):
    adapter = operations.adapter
    changes = validate_changes(adapter, params)
    unconfirmed = False
    for field, value, service, data in changes:
        adapter.ensure_current()
        if not adapter.available:
            raise AdapterError("unavailable")
        current = adapter.hass.states.get(field["entity_id"])
        if current is None or current.state in ("unknown", "unavailable"):
            raise AdapterError("unavailable")
        await adapter.hass.services.async_call(field["kind"], service, data, blocking=True)
        adapter.ensure_current()
        completed.append(field["entity_id"])
        actual = adapter.hass.states.get(field["entity_id"])
        if actual is None:
            unconfirmed = True
        elif field["kind"] == "number":
            try:
                unconfirmed |= not math.isclose(float(actual.state), value, abs_tol=0.0001)
            except ValueError:
                unconfirmed = True
        else:
            expected = ("on" if value else "off") if field["kind"] == "switch" else str(value)
            unconfirmed |= actual.state != expected
    return operations.result(
        request_id,
        "unconfirmed" if unconfirmed else "confirmed",
        completed=completed,
        error="readback_pending" if unconfirmed else None,
    )
