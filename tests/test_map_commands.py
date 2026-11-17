from types import SimpleNamespace as NS
from unittest.mock import AsyncMock

import pytest
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from vacuum_map_parser_base.map_data import MapData, Room

from custom_components.roborock_companion.operations import Operations


@pytest.fixture(autouse=True)
def verified_fixture_protocol(adapter, monkeypatch):
    from custom_components.roborock_companion.capabilities import VERIFIED_MAP_PROTOCOLS

    device_id = er.async_get(adapter.hass).async_get(adapter.entity_id).device_id
    dr.async_get(adapter.hass).async_update_device(device_id, model="Fixture", sw_version="test")
    monkeypatch.setitem(VERIFIED_MAP_PROTOCOLS, ("Fixture", "test"), {"room_merge": "plain"})
    adapter.coordinator.properties_api.status = NS(state=NS(name="charging"), refresh=AsyncMock())


async def test_merge_uses_verified_feature_and_correct_room_payload(adapter):
    api = adapter.coordinator.properties_api
    data = MapData()
    data.rooms = {16: Room(0, 0, 100, 100, 16, "Room 1"), 17: Room(100, 0, 200, 100, 17, "Room 2")}
    info = NS(name="Floor 1", rooms=[])

    async def refresh():

        if any(c.args[0] == "merge_segment" for c in api.command.send.await_args_list):
            data.rooms.pop(17)

    api.device_features = NS(is_re_segment_supported=True, is_rpc_retry_supported=False)
    api.maps = NS(current_map=0, refresh=AsyncMock(), map_info=[NS(map_flag=0)])
    api.home = NS(
        home_map_info={0: info},
        home_map_content={0: NS(map_data=data, raw_api_response=b"fixture")},
    )
    api.map_content = NS(
        map_data=data,
        image_content=None,
        raw_api_response=b"fixture",
        refresh=AsyncMock(side_effect=refresh),
    )
    api.command.send.return_value = ["ok"]
    result = await Operations(adapter).async_execute(
        "room_merge",
        {"map_id": 0, "rooms": [16, 17]},
        adapter.get_snapshot()["revision"],
        "merge",
        is_admin=True,
    )
    assert result["status"] == "unconfirmed"
    assert [call.args[0] for call in api.command.send.await_args_list] == [
        "start_edit_map",
        "merge_segment",
        "end_edit_map",
    ]
    assert api.command.send.await_args_list[1].kwargs == {"params": [16, 17]}


async def test_map_edit_rejects_unrelated_floor_before_command(adapter):
    result = await Operations(adapter).async_execute(
        "room_split",
        {"map_id": 9, "room_id": 16, "line": [0, 0, 100, 100]},
        adapter.get_snapshot()["revision"],
        "split_wrong",
        is_admin=True,
    )
    assert result["error"] == "wrong_map_or_busy"
    adapter.coordinator.properties_api.command.send.assert_not_awaited()


async def test_failed_edit_session_cleanup_is_never_reported_confirmed(adapter):
    from custom_components.roborock_companion.adapter import AdapterError

    api = adapter.coordinator.properties_api
    data = MapData()
    data.rooms = {16: Room(0, 0, 100, 100, 16, "Room 1"), 17: Room(100, 0, 200, 100, 17, "Room 2")}
    api.device_features = NS(is_re_segment_supported=True, is_rpc_retry_supported=False)
    api.maps = NS(current_map=0, refresh=AsyncMock(), map_info=[NS(map_flag=0)])
    api.home = NS(
        home_map_info={0: NS(name="Floor 1", rooms=[])},
        home_map_content={0: NS(map_data=data, raw_api_response=b"fixture")},
    )

    async def refresh():

        if any(c.args[0] == "merge_segment" for c in api.command.send.await_args_list):
            data.rooms.pop(17)

    async def send(method, params=None):
        if method == "end_edit_map":
            raise AdapterError("robot_rejected")
        return ["ok"]

    api.map_content = NS(
        map_data=data,
        image_content=None,
        raw_api_response=b"fixture",
        refresh=AsyncMock(side_effect=refresh),
    )
    api.command.send.side_effect = send
    result = await Operations(adapter).async_execute(
        "room_merge",
        {"map_id": 0, "rooms": [16, 17]},
        adapter.get_snapshot()["revision"],
        "cleanup",
        is_admin=True,
    )
    assert result["status"] == "unconfirmed"
    assert result["completed_steps"] == ["merge_segment"]


@pytest.mark.parametrize("change", ["floor", "activity", "geometry"])
async def test_revalidates_after_edit_session_await(adapter, change):
    api = adapter.coordinator.properties_api
    data = MapData()
    data.rooms = {16: Room(0, 0, 100, 100, 16, "A"), 17: Room(100, 0, 200, 100, 17, "B")}
    api.device_features = NS(is_re_segment_supported=True)
    api.maps = NS(current_map=0, refresh=AsyncMock(), map_info=[NS(map_flag=0)])
    api.home = NS(
        home_map_info={0: NS(name="Floor", rooms=[])},
        home_map_content={0: NS(map_data=data, raw_api_response=b"fixture")},
    )
    api.map_content = NS(refresh=AsyncMock(), map_data=data, raw_api_response=b"fixture")

    async def send(method, params=None):
        if method == "start_edit_map":
            if change == "floor":
                api.maps.current_map = 1
            elif change == "activity":
                adapter.hass.states.async_set(adapter.entity_id, "cleaning")
            else:
                data.rooms[18] = Room(0, 100, 100, 200, 18, "Changed")
        return ["ok"]

    api.command.send.side_effect = send
    result = await Operations(adapter).async_execute(
        "room_merge",
        {"map_id": 0, "rooms": [16, 17]},
        adapter.get_snapshot()["revision"],
        "stale",
        is_admin=True,
    )
    assert result["status"] == "failed"
    assert "merge_segment" not in [c.args[0] for c in api.command.send.await_args_list]
    assert api.command.send.await_args_list[-1].args[0] == "end_edit_map"


async def test_cleanup_retry_is_explicitly_unconfirmed(adapter):
    api = adapter.coordinator.properties_api
    data = MapData()
    data.rooms = {16: Room(0, 0, 100, 100, 16, "A"), 17: Room(100, 0, 200, 100, 17, "B")}
    api.device_features = NS(is_re_segment_supported=True)
    api.maps = NS(current_map=0, refresh=AsyncMock(), map_info=[NS(map_flag=0)])
    api.home = NS(
        home_map_info={0: NS(name="Floor", rooms=[])},
        home_map_content={0: NS(map_data=data, raw_api_response=b"fixture")},
    )
    api.map_content = NS(refresh=AsyncMock(), map_data=data, raw_api_response=b"fixture")
    api.command.send.side_effect = lambda method, params=None: (
        ["retry"] if method == "end_edit_map" else ["ok"]
    )
    result = await Operations(adapter).async_execute(
        "room_merge",
        {"map_id": 0, "rooms": [16, 17]},
        adapter.get_snapshot()["revision"],
        "close_retry",
        is_admin=True,
    )
    assert result["status"] == "unconfirmed"
    assert result["error"] == "edit_session_unconfirmed"


async def test_verified_merge_profile_does_not_enable_unverified_materials(adapter):
    api = adapter.coordinator.properties_api
    api.device_features = NS(is_re_segment_supported=True, is_support_floor_edit=True)
    data = MapData()
    api.maps = NS(current_map=0)
    api.home = NS(
        home_map_info={0: NS(name="Floor", rooms=[])}, home_map_content={0: NS(map_data=data)}
    )
    capabilities = adapter.get_snapshot()["capabilities"]
    assert capabilities["room_merge"]["status"] == "available"
    assert capabilities["floor_material"]["status"] == "unverified"
