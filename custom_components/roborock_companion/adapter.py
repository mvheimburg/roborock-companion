"""The only bridge to the official integration's private runtime.

Never creates a client, handles credentials or closes the shared robot connection.
"""

import asyncio
import hashlib
import json
from collections.abc import Callable
from typing import Any

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import callback
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.util import dt as dt_util


class AdapterError(ValueError):
    """Stable error at the official integration boundary."""


class RoborockAdapter:
    def __init__(self, hass, vacuum_entity_id: str):
        self.hass = hass
        self.entity_id = vacuum_entity_id
        self.generation = 0
        self.coordinator = None
        self.entry = None
        self._runtime = None
        self._unsubs: list[Callable] = []
        self._listeners: list[Callable] = []
        self._parent_unsub = None
        self.extra: dict[str, Any] = {}

    async def async_bind(self):
        await self.async_close()
        entity = er.async_get(self.hass).async_get(self.entity_id)
        if entity is None or entity.platform != "roborock" or entity.domain != "vacuum":
            raise AdapterError("invalid_binding")
        entry = self.hass.config_entries.async_get_entry(entity.config_entry_id)
        device = dr.async_get(self.hass).async_get(entity.device_id) if entity.device_id else None
        runtime = getattr(entry, "runtime_data", None)
        if not entry or entry.domain != "roborock" or not device or runtime is None:
            raise AdapterError("invalid_binding")
        values = getattr(runtime, "values", None)
        if not callable(values):
            raise AdapterError("incompatible_api")
        matches = [
            c for c in values() if set(c.device_info.get("identifiers", ())) & device.identifiers
        ]
        if len(matches) != 1:
            raise AdapterError("invalid_binding")
        coordinator = matches[0]
        api = getattr(coordinator, "properties_api", None)
        if api is None or not callable(getattr(getattr(api, "command", None), "send", None)):
            raise AdapterError("incompatible_api")
        self.entry, self._runtime, self.coordinator = entry, runtime, coordinator
        self._unsubs.append(coordinator.async_add_listener(self._notify))
        self._parent_unsub = entry.async_on_state_change(self._parent_changed)
        self._notify()

    @callback
    def _parent_changed(self):
        if self.entry and self.entry.state is ConfigEntryState.LOADED:
            self.hass.async_create_task(self._async_rebind())
        else:
            self._invalidate()
            self._notify()

    async def _async_rebind(self):
        try:
            await self.async_bind()
        except AdapterError:
            self._notify()

    def _invalidate(self):
        self.generation += 1
        for unsub in self._unsubs:
            unsub()
        self._unsubs.clear()
        self.coordinator = None
        self._runtime = None
        self.extra.clear()

    def add_listener(self, callback):
        self._listeners.append(callback)
        return lambda: self._listeners.remove(callback) if callback in self._listeners else None

    def _notify(self):
        for listener in tuple(self._listeners):
            listener()

    async def async_close(self):
        self._invalidate()
        if self._parent_unsub:
            self._parent_unsub()
            self._parent_unsub = None
        self.entry = None

    def ensure_current(self):
        entity = er.async_get(self.hass).async_get(self.entity_id)
        if (
            self.coordinator is None
            or self.entry is None
            or self.hass.config_entries.async_get_entry(self.entry.entry_id) is not self.entry
            or getattr(self.entry, "runtime_data", None) is not self._runtime
            or entity is None
            or entity.config_entry_id != self.entry.entry_id
        ):
            raise AdapterError("binding_changed")

    @property
    def available(self):
        try:
            self.ensure_current()
        except AdapterError:
            return False
        state = self.hass.states.get(self.entity_id)
        return bool(
            state
            and state.state not in ("unknown", "unavailable")
            and self.coordinator.device.is_connected
        )

    async def async_command(self, method: str, params=None):
        self.ensure_current()
        if not self.available:
            raise AdapterError("unavailable")
        generation = self.generation
        response = await asyncio.wait_for(
            self.coordinator.properties_api.command.send(method, params=params),
            timeout=25,
        )
        self.ensure_current()
        if generation != self.generation:
            raise AdapterError("binding_changed")
        if isinstance(response, dict) and "error" in response:
            raise AdapterError("robot_rejected")
        return response

    def get_snapshot(self):
        available = self.available
        state = self.hass.states.get(self.entity_id)
        data = {
            "api_version": 1,
            "entity_id": self.entity_id,
            "available": available,
            "state": state.state if state else "unavailable",
            "generation": self.generation,
            "connection": {
                "local_available": bool(available and self.coordinator.device.is_local_connected),
                "command_transport": "ha_managed",
                "maps_transport": "cloud",
            },
            "maps": [],
            "settings": [],
            "schedules": [],
            "capabilities": {},
        } | self.extra
        content = json.dumps(data, sort_keys=True, default=str)
        data["revision"] = hashlib.sha256(content.encode()).hexdigest()[:20]
        data["updated_at"] = dt_util.utcnow().isoformat()
        return data
