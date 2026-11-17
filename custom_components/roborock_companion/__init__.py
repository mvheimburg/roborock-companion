"""Advanced controls using the official Roborock integration."""

from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import config_validation as cv

from .adapter import AdapterError, RoborockAdapter
from .const import DOMAIN

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass, config):
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass, entry):
    adapter = RoborockAdapter(hass, entry.data["entity_id"])
    try:
        await adapter.async_bind()
    except AdapterError as err:
        raise ConfigEntryNotReady(str(err)) from err
    entry.runtime_data = adapter
    hass.data.setdefault(DOMAIN, {})[entry.entry_id] = adapter
    return True


async def async_unload_entry(hass, entry):
    adapter = hass.data.get(DOMAIN, {}).pop(entry.entry_id, None)
    if adapter:
        await adapter.async_close()
    return True
