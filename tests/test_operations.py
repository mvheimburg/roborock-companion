import asyncio

from custom_components.roborock_companion.operations import Operations


async def test_rejects_stale_unauthorized_and_raw_commands(adapter):
    ops = Operations(adapter)
    revision = adapter.get_snapshot()["revision"]
    for operation, rev, admin, error in [
        ("schedules_read", "stale", True, "conflict"),
        ("schedules_read", revision, False, "unauthorized"),
        ("get_status", revision, True, "unsupported_operation"),
    ]:
        result = await ops.async_execute(operation, {}, rev, f"req_{error}", is_admin=admin)
        assert result["status"] == "failed"
        assert result["error"] == error
    adapter.coordinator.properties_api.command.send.assert_not_awaited()


async def test_duplicate_request_does_not_resend(adapter):
    ops = Operations(adapter)
    revision = adapter.get_snapshot()["revision"]
    result = await ops.async_execute("schedules_read", {}, revision, "read_1", is_admin=True)
    duplicate = await ops.async_execute("schedules_read", {}, revision, "read_1", is_admin=True)
    assert result == duplicate
    assert result["status"] == "confirmed"
    adapter.coordinator.properties_api.command.send.assert_awaited_once_with("get_timer", params=[])


async def test_retry_ack_is_not_confirmed(adapter):
    adapter.coordinator.properties_api.command.send.return_value = ["retry"]
    ops = Operations(adapter)
    result = await ops.async_execute(
        "schedules_read", {}, adapter.get_snapshot()["revision"], "retry_1", is_admin=True
    )
    assert result["status"] == "unconfirmed"


async def test_unverified_map_replacement_sends_nothing(adapter):
    ops = Operations(adapter)
    result = await ops.async_execute(
        "map_restrictions_save",
        {"map_id": 0, "walls": []},
        adapter.get_snapshot()["revision"],
        "map_1",
        is_admin=True,
    )
    assert result["status"] == "failed"
    assert result["error"] == "preservation_unverified"
    adapter.coordinator.properties_api.command.send.assert_not_awaited()


async def test_busy_operation_is_not_queued(adapter):
    entered, release = asyncio.Event(), asyncio.Event()

    async def send(*args, **kwargs):
        entered.set()
        await release.wait()
        return []

    adapter.coordinator.properties_api.command.send.side_effect = send
    ops = Operations(adapter)
    rev = adapter.get_snapshot()["revision"]
    first = asyncio.create_task(ops.async_execute("schedules_read", {}, rev, "a", is_admin=True))
    await entered.wait()
    second = await ops.async_execute("schedules_read", {}, rev, "b", is_admin=True)
    assert second["error"] == "busy"
    release.set()
    assert (await first)["status"] == "confirmed"


async def test_room_display_name_persists_in_ha_without_robot_mutation(hass, adapter):
    from types import SimpleNamespace as NS

    from pytest_homeassistant_custom_component.common import MockConfigEntry

    companion = MockConfigEntry(domain="roborock_companion", data={"entity_id": adapter.entity_id})
    companion.add_to_hass(hass)
    adapter.companion_entry = companion
    api = adapter.coordinator.properties_api
    api.home = NS(
        home_map_info={0: NS(name="Floor 1", rooms=[NS(segment_id=16, name="Room 1")])},
        home_map_content={},
    )
    api.maps = NS(current_map=0)
    ops = Operations(adapter)
    result = await ops.async_execute(
        "room_display_save",
        {"map_id": 0, "room_id": 16, "name": "Reading room"},
        adapter.get_snapshot()["revision"],
        "name",
        is_admin=True,
    )
    assert result["status"] == "confirmed"
    assert companion.options["room_names"] == {"0:16": "Reading room"}
    assert adapter.get_snapshot()["maps"][0]["rooms"][0]["name"] == "Reading room"
    api.command.send.assert_not_awaited()
