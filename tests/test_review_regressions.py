import struct
from types import SimpleNamespace as NS

import pytest
from aiohttp import web
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from vacuum_map_parser_base.config.color import ColorsPalette
from vacuum_map_parser_base.config.image_config import ImageConfig
from vacuum_map_parser_base.config.size import Sizes
from vacuum_map_parser_base.map_data import MapData, Room
from vacuum_map_parser_roborock.map_data_parser import RoborockMapDataParser

from custom_components.roborock_companion.adapter import AdapterError
from custom_components.roborock_companion.map_audit import audit_map
from custom_components.roborock_companion.operations import Operations
from custom_components.roborock_companion.panel import MapView


def wall_map(*walls):
    raw = b"rr" + struct.pack("<H", 20) + bytes(16)
    for wall in walls:
        raw += struct.pack("<HHIH", 10, 12, 8, 1) + bytes(2) + struct.pack("<4H", *wall)
    return raw


def test_duplicate_walls_dropped_by_real_parser_never_enable_replacement():
    raw = wall_map([100, 100, 200, 200], [300, 300, 400, 400])
    parser = RoborockMapDataParser(ColorsPalette(), Sizes(), [], ImageConfig(), [])
    parsed = parser.parse(raw)
    assert len(parsed.walls) == 1  # actual parser overwrites the first collection
    image = struct.pack("<HHI", 2, 8, 1) + b"x"
    digest = struct.pack("<HHI", 1024, 8, 0)
    assert audit_map(raw + image + digest)["blocker"] == "preservation_unverified"


async def test_registry_device_reassignment_invalidates_adapter(hass, adapter):
    entry = er.async_get(hass).async_get(adapter.entity_id)
    other = dr.async_get(hass).async_get_or_create(
        config_entry_id=adapter.entry.entry_id, identifiers={("roborock", "other")}
    )
    er.async_get(hass).async_update_entity(entry.entity_id, device_id=other.id)
    assert not adapter.available
    with pytest.raises(AdapterError):
        await adapter.async_command("get_timer", [])


async def test_image_version_mismatch_never_serves_new_geometry(adapter):
    api = adapter.coordinator.properties_api
    api.maps = NS(current_map=0)
    api.home = NS(
        home_map_info={0: NS(name="Floor", rooms=[])},
        home_map_content={0: NS(image_content=b"new-image")},
    )
    user = NS(permissions=NS(check_entity=lambda *a: True))
    request = {"hass_user": user}

    class Request(dict):
        query = {"v": "old-image-hash"}

    adapter.hass.data["roborock_companion"] = {"bound": adapter}
    with pytest.raises(web.HTTPConflict):
        await MapView(adapter.hass).get(Request(request), adapter.entity_id, "0")


async def test_multi_floor_never_labels_shared_live_bytes_as_selected_floor(adapter):
    api = adapter.coordinator.properties_api
    first, second, live = MapData(), MapData(), MapData()
    first.rooms = {16: Room(0, 0, 100, 100, 16, "First")}
    second.rooms = {17: Room(0, 0, 100, 100, 17, "Second")}
    live.rooms = first.rooms
    api.maps = NS(current_map=1)
    api.home = NS(
        home_map_info={0: NS(name="First", rooms=[]), 1: NS(name="Second", rooms=[])},
        home_map_content={0: NS(map_data=first), 1: NS(map_data=second)},
    )
    api.map_content = NS(map_data=live)
    assert adapter.get_snapshot()["maps"][1]["rooms"][0]["id"] == 17


async def test_general_retry_feature_does_not_verify_map_protocol(adapter):
    api = adapter.coordinator.properties_api
    api.device_features = NS(is_rpc_retry_supported=True, is_re_segment_supported=True)
    data = MapData()
    data.rooms = {16: Room(0, 0, 100, 100, 16, "A"), 17: Room(0, 0, 100, 100, 17, "B")}
    api.maps = NS(current_map=0)
    api.home = NS(
        home_map_info={0: NS(name="Floor", rooms=[])}, home_map_content={0: NS(map_data=data)}
    )
    assert adapter.get_snapshot()["capabilities"]["room_merge"]["status"] != "available"


async def test_coordinate_action_uses_checked_revision_and_public_ha_service(hass, adapter):
    api = adapter.coordinator.properties_api
    calibration = [
        {"map": {"x": 0, "y": 0}, "vacuum": {"x": 0, "y": 0}},
        {"map": {"x": 100, "y": 0}, "vacuum": {"x": 100, "y": 0}},
        {"map": {"x": 0, "y": 100}, "vacuum": {"x": 0, "y": 100}},
    ]
    data = NS(calibration=lambda: calibration, rooms={}, image=NS(data=NS(size=(100, 100))))
    api.maps = NS(current_map=0)
    api.home = NS(
        home_map_info={0: NS(name="Floor", rooms=[])},
        home_map_content={0: NS(map_data=data, image_content=b"image")},
    )
    calls = []

    async def goto(call):
        calls.append(call.data)

    hass.services.async_register("roborock", "set_vacuum_goto_position", goto)
    ops = Operations(adapter)
    revision = adapter.get_snapshot()["revision"]
    result = await ops.async_execute(
        "map_goto", {"map_id": 0, "x": 100, "y": 200}, revision, "goto", is_admin=True
    )
    assert result["status"] == "unconfirmed"  # dispatch is not physical completion
    assert calls == [{"entity_id": adapter.entity_id, "x": 100, "y": 200}]
    api.maps.current_map = 1
    await ops.async_execute(
        "map_goto", {"map_id": 0, "x": 100, "y": 200}, revision, "stale_goto", is_admin=True
    )
    assert len(calls) == 1


def test_geometry_limit_never_certifies_an_omitted_restriction():
    from vacuum_map_parser_base.map_data import Wall

    from custom_components.roborock_companion.map_geometry import convert_map

    calibration = [
        {"map": {"x": 0, "y": 0}, "vacuum": {"x": 0, "y": 0}},
        {"map": {"x": 1, "y": 0}, "vacuum": {"x": 1, "y": 0}},
        {"map": {"x": 0, "y": 1}, "vacuum": {"x": 0, "y": 1}},
    ]
    raw = (
        b"rr"
        + struct.pack("<H", 20)
        + bytes(16)
        + struct.pack("<HHI", 2, 8, 1)
        + b"x"
        + struct.pack("<HHIHH", 10, 12, 129 * 8, 129, 0)
        + bytes(129 * 8)
        + struct.pack("<HHI", 1024, 8, 0)
    )
    data = NS(calibration=lambda: calibration, rooms={}, walls=[Wall(0, 0, 1, 1)] * 129)
    result = convert_map(0, NS(name="Floor", rooms=[]), NS(map_data=data, raw_api_response=raw))
    assert not result["preservation_complete"]
