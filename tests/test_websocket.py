from homeassistant.setup import async_setup_component

from custom_components.roborock_companion.const import DOMAIN
from custom_components.roborock_companion.websocket import async_register


async def test_websocket_returns_bound_snapshot_and_rejects_other_robot(
    hass, adapter, hass_ws_client
):
    hass.data[DOMAIN] = {"companion": adapter}
    await async_setup_component(hass, "websocket_api", {})
    async_register(hass)
    client = await hass_ws_client(hass)
    await client.send_json(
        {"id": 1, "type": "roborock_companion/snapshot", "entity_id": adapter.entity_id}
    )
    result = await client.receive_json()
    assert result["success"] is True
    assert result["result"]["api_version"] == 1
    assert result["result"]["entity_id"] == adapter.entity_id
    await client.send_json(
        {"id": 2, "type": "roborock_companion/snapshot", "entity_id": "vacuum.foreign"}
    )
    result = await client.receive_json()
    assert result["success"] is False
    assert result["error"]["code"] == "not_found"


async def test_custom_server_is_not_labelled_roborock_cloud(adapter):
    assert adapter.get_snapshot()["connection"]["server_kind"] == "custom_server"
