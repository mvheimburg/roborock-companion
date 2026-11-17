from types import SimpleNamespace
from unittest.mock import AsyncMock

from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er


def add_robot(hass, entry, suffix, command=None):
    device = dr.async_get(hass).async_get_or_create(
        config_entry_id=entry.entry_id,
        identifiers={("roborock", suffix)},
        name=suffix,
    )
    entity = er.async_get(hass).async_get_or_create(
        "vacuum",
        "roborock",
        suffix,
        device_id=device.id,
        config_entry=entry,
        suggested_object_id=suffix,
    )
    hass.states.async_set(entity.entity_id, "docked")
    coordinator = SimpleNamespace(
        duid=suffix,
        duid_slug=suffix,
        device=SimpleNamespace(is_local_connected=True, is_connected=True),
        device_info={"identifiers": {("roborock", suffix)}},
        properties_api=SimpleNamespace(
            command=SimpleNamespace(send=command or AsyncMock(return_value=["ok"]))
        ),
        async_add_listener=lambda callback: lambda: None,
    )
    return entity.entity_id, coordinator
