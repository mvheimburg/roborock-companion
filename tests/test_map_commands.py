from types import SimpleNamespace as NS
from unittest.mock import AsyncMock

from vacuum_map_parser_base.map_data import MapData, Room

from custom_components.roborock_companion.operations import Operations


async def test_merge_uses_verified_feature_and_correct_room_payload(adapter):
    api = adapter.coordinator.properties_api
    data = MapData()
    data.rooms = {16: Room(0, 0, 100, 100, 16, "Room 1"), 17: Room(100, 0, 200, 100, 17, "Room 2")}
    info = NS(name="Floor 1", rooms=[])

    async def refresh():
        data.rooms.pop(17)

    api.device_features = NS(is_re_segment_supported=True, is_rpc_retry_supported=False)
    api.maps = NS(current_map=0)
    api.home = NS(home_map_info={0: info}, home_map_content={})
    api.map_content = NS(
        map_data=data,
        image_content=None,
        raw_api_response=None,
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
    assert result["status"] == "confirmed"
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
    api.maps = NS(current_map=0)
    api.home = NS(home_map_info={0: NS(name="Floor 1", rooms=[])}, home_map_content={})

    async def refresh():
        data.rooms.pop(17)

    async def send(method, params=None):
        if method == "end_edit_map":
            raise AdapterError("robot_rejected")
        return ["ok"]

    api.map_content = NS(
        map_data=data,
        image_content=None,
        raw_api_response=None,
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
