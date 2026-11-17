from homeassistant.helpers import entity_registry as er

from custom_components.roborock_companion.operations import Operations
from custom_components.roborock_companion.settings import get_settings


def setting(hass, adapter, suffix, domain="select", state="standard", attrs=None):
    robot = er.async_get(hass).async_get(adapter.entity_id)
    entity = er.async_get(hass).async_get_or_create(
        domain,
        "roborock",
        suffix,
        device_id=robot.device_id,
        config_entry=adapter.entry,
        suggested_object_id=suffix,
    )
    hass.states.async_set(
        entity.entity_id,
        state,
        attrs or {"options": ["standard", "deep"], "friendly_name": "Mop route"},
    )
    return entity.entity_id


async def test_draft_validation_sends_no_partial_invalid_save(hass, adapter):
    entity_id = setting(hass, adapter, "mop")
    fields = get_settings(adapter)
    assert fields[0]["entity_id"] == entity_id
    assert fields[0]["options"] == ["standard", "deep"]
    ops = Operations(adapter)
    result = await ops.async_execute(
        "settings_save",
        {
            "changes": [
                {"entity_id": entity_id, "value": "deep"},
                {"entity_id": "switch.foreign", "value": True},
            ]
        },
        adapter.get_snapshot()["revision"],
        "invalid",
        is_admin=True,
    )
    assert result["error"] == "invalid_setting"
    assert hass.states.get(entity_id).state == "standard"


async def test_settings_use_real_public_service_and_readback(hass, adapter):
    entity_id = setting(hass, adapter, "mop")
    calls = []

    async def select(call):
        calls.append(call.data)
        hass.states.async_set(entity_id, call.data["option"], {"options": ["standard", "deep"]})

    hass.services.async_register("select", "select_option", select)
    ops = Operations(adapter)
    result = await ops.async_execute(
        "settings_save",
        {"changes": [{"entity_id": entity_id, "value": "deep"}]},
        adapter.get_snapshot()["revision"],
        "save_1",
        is_admin=True,
    )
    assert result["status"] == "confirmed"
    assert calls == [{"entity_id": entity_id, "option": "deep"}]
    assert hass.states.get(entity_id).state == "deep"
    adapter.coordinator.properties_api.command.send.assert_not_awaited()


async def test_partial_settings_save_reports_completed_steps(hass, adapter):
    a = setting(hass, adapter, "mop_a")
    b = setting(hass, adapter, "mop_b")

    async def select(call):
        if call.data["entity_id"] == b:
            raise ValueError("device_refused")
        hass.states.async_set(a, "deep", {"options": ["standard", "deep"]})

    hass.services.async_register("select", "select_option", select)
    result = await Operations(adapter).async_execute(
        "settings_save",
        {"changes": [{"entity_id": a, "value": "deep"}, {"entity_id": b, "value": "deep"}]},
        adapter.get_snapshot()["revision"],
        "partial",
        is_admin=True,
    )
    assert result["status"] == "failed"
    assert result["completed_steps"] == [a]
    assert hass.states.get(a).state == "deep"
    assert hass.states.get(b).state == "standard"
