"""Advanced controls using the official Roborock integration."""

from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er

from .adapter import AdapterError, RoborockAdapter
from .const import DOMAIN

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass, config):
    hass.data.setdefault(DOMAIN, {})
    from .websocket import async_register

    async_register(hass)
    return True


async def async_setup_entry(hass, entry):
    entity = er.async_get(hass).async_get(entry.unique_id or entry.data["entity_id"])
    adapter = RoborockAdapter(
        hass,
        entity.entity_id if entity else entry.data["entity_id"],
        expected_device_id=entry.data.get("device_id"),
    )
    try:
        await adapter.async_bind()
    except AdapterError as err:
        raise ConfigEntryNotReady(str(err)) from err
    if entry.data.get("device_id") != adapter._device_id:
        hass.config_entries.async_update_entry(
            entry, data=dict(entry.data) | {"device_id": adapter._device_id}
        )
    adapter.companion_entry = entry
    entry.runtime_data = adapter
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = adapter
    from . import panel

    await panel.async_register(hass)
    return True


async def async_unload_entry(hass, entry):
    adapter = hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    if adapter:
        await adapter.async_close()
    if not hass.data.get(DOMAIN):
        from . import panel

        panel.async_unregister(hass)
    return True
