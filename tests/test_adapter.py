from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.roborock_companion.adapter import AdapterError, RoborockAdapter

from .helpers import add_robot


async def test_resolves_second_robot_without_copying_connection(hass):
    entry = MockConfigEntry(domain="roborock", data={})
    entry.add_to_hass(hass)
    first_id, first = add_robot(hass, entry, "room_1")
    second_id, second = add_robot(hass, entry, "room_2")
    entry.runtime_data = SimpleNamespace(values=lambda: [first, second])
    adapter = RoborockAdapter(hass, second_id)
    await adapter.async_bind()
    assert await adapter.async_command("get_timer", []) == ["ok"]
    second.properties_api.command.send.assert_awaited_once_with("get_timer", params=[])
    first.properties_api.command.send.assert_not_awaited()
    await adapter.async_close()
    assert hass.states.get(first_id).state == "docked"


async def test_rejects_foreign_and_missing_robot(hass):
    for entity_id in ("vacuum.missing", "light.kitchen"):
        with pytest.raises(AdapterError, match="invalid_binding"):
            await RoborockAdapter(hass, entity_id).async_bind()


async def test_close_invalidates_inflight_result(hass):
    import asyncio

    entry = MockConfigEntry(domain="roborock", data={})
    entry.add_to_hass(hass)
    entered, release = asyncio.Event(), asyncio.Event()

    async def send(*args, **kwargs):
        entered.set()
        await release.wait()
        return ["ok"]

    entity_id, coordinator = add_robot(hass, entry, "robot", AsyncMock(side_effect=send))
    entry.runtime_data = SimpleNamespace(values=lambda: [coordinator])
    adapter = RoborockAdapter(hass, entity_id)
    await adapter.async_bind()
    pending = asyncio.create_task(adapter.async_command("get_timer", []))
    await entered.wait()
    await adapter.async_close()
    release.set()
    with pytest.raises(AdapterError, match="binding_changed"):
        await pending


async def test_incompatible_runtime_fails_clearly(hass):
    entry = MockConfigEntry(domain="roborock", data={})
    entry.add_to_hass(hass)
    entity_id, coordinator = add_robot(hass, entry, "robot")
    coordinator.properties_api = None
    entry.runtime_data = SimpleNamespace(values=lambda: [coordinator])
    with pytest.raises(AdapterError, match="incompatible_api"):
        await RoborockAdapter(hass, entity_id).async_bind()


async def test_official_unload_makes_cached_data_unavailable(hass):
    from homeassistant.config_entries import ConfigEntryState

    entry = MockConfigEntry(domain="roborock", data={})
    entry.add_to_hass(hass)
    entity_id, coordinator = add_robot(hass, entry, "robot")
    entry.runtime_data = SimpleNamespace(values=lambda: [coordinator])
    adapter = RoborockAdapter(hass, entity_id)
    await adapter.async_bind()
    entry._async_set_state(hass, ConfigEntryState.UNLOAD_IN_PROGRESS, None)
    await hass.async_block_till_done()
    assert not adapter.get_snapshot()["available"]
    with pytest.raises(AdapterError):
        await adapter.async_command("get_timer", [])


async def test_failed_coordinator_blocks_actions_on_retained_state(hass, adapter):
    adapter.coordinator.last_update_success = False
    assert hass.states.get(adapter.entity_id).state == "docked"
    assert adapter.get_snapshot()["available"] is False
    with pytest.raises(AdapterError, match="unavailable"):
        await adapter.async_command("get_timer", [])
