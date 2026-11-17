"""Authenticated, device-scoped UI API. Never exposes arbitrary robot RPC."""

import voluptuous as vol
from homeassistant.auth.permissions.const import POLICY_READ
from homeassistant.components import websocket_api
from homeassistant.core import callback

from .const import DOMAIN
from .operations import Operations


def _find(hass, connection, msg):
    entity_id = msg["entity_id"]
    if not connection.user.permissions.check_entity(entity_id, POLICY_READ):
        connection.send_error(msg["id"], "unauthorized", "Access to this robot is required")
        return None
    adapter = next(
        (a for a in hass.data.get(DOMAIN, {}).values() if a.entity_id == entity_id), None
    )
    if adapter is None:
        connection.send_error(
            msg["id"], "not_found", "Robot is not configured in Roborock Companion"
        )
    return adapter


@callback
def async_register(hass):
    for command in (ws_list, ws_snapshot, ws_subscribe, ws_execute):
        websocket_api.async_register_command(hass, command)


@websocket_api.websocket_command({vol.Required("type"): "roborock_companion/list"})
@callback
def ws_list(hass, connection, msg):
    entries = []
    for adapter in hass.data.get(DOMAIN, {}).values():
        if connection.user.permissions.check_entity(adapter.entity_id, POLICY_READ):
            state = hass.states.get(adapter.entity_id)
            entries.append(
                {
                    "entity_id": adapter.entity_id,
                    "name": state.name if state else adapter.entity_id,
                    "available": adapter.available,
                }
            )
    connection.send_result(msg["id"], {"api_version": 1, "robots": entries})


@websocket_api.websocket_command(
    {vol.Required("type"): "roborock_companion/snapshot", vol.Required("entity_id"): str}
)
@callback
def ws_snapshot(hass, connection, msg):
    if adapter := _find(hass, connection, msg):
        connection.send_result(msg["id"], adapter.get_snapshot())


@websocket_api.websocket_command(
    {vol.Required("type"): "roborock_companion/subscribe", vol.Required("entity_id"): str}
)
@callback
def ws_subscribe(hass, connection, msg):
    if (adapter := _find(hass, connection, msg)) is None:
        return

    @callback
    def update():
        if connection.user.permissions.check_entity(adapter.entity_id, POLICY_READ):
            connection.send_event(msg["id"], adapter.get_snapshot())

    connection.subscriptions[msg["id"]] = adapter.add_listener(update)
    connection.send_result(msg["id"])
    update()


@websocket_api.require_admin
@websocket_api.websocket_command(
    {
        vol.Required("type"): "roborock_companion/execute",
        vol.Required("entity_id"): str,
        vol.Required("operation"): str,
        vol.Required("params"): dict,
        vol.Required("expected_revision"): str,
        vol.Required("request_id"): str,
    }
)
@websocket_api.async_response
async def ws_execute(hass, connection, msg):
    if (adapter := _find(hass, connection, msg)) is None:
        return
    if not hasattr(adapter, "operations"):
        adapter.operations = Operations(adapter)
    result = await adapter.operations.async_execute(
        msg["operation"],
        msg["params"],
        msg["expected_revision"],
        msg["request_id"],
        is_admin=connection.user.is_admin,
    )
    connection.send_result(msg["id"], result)
