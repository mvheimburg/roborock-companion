"""Serve the desktop/tablet configuration panel inside Home Assistant."""

import hashlib
from pathlib import Path

from aiohttp import web
from homeassistant.auth.permissions.const import POLICY_READ
from homeassistant.components import frontend, panel_custom
from homeassistant.components.http import HomeAssistantView, StaticPathConfig

from .const import DOMAIN, VERSION

STATIC = "/roborock_companion_static"
BUNDLE = Path(__file__).parent / "frontend"


class MapView(HomeAssistantView):
    url = "/api/roborock_companion/map/{entity_id}/{map_id}"
    name = "api:roborock_companion:map"
    requires_auth = True

    def __init__(self, hass):
        self.hass = hass

    async def get(self, request, entity_id, map_id):
        user = request["hass_user"]
        if not user.permissions.check_entity(entity_id, POLICY_READ):
            raise web.HTTPForbidden()
        adapter = next(
            (a for a in self.hass.data.get(DOMAIN, {}).values() if a.entity_id == entity_id), None
        )
        if adapter is None or not adapter.available:
            raise web.HTTPNotFound()
        try:
            flag = int(map_id)
        except ValueError as err:
            raise web.HTTPNotFound() from err
        content = adapter.map_content(flag)
        image = getattr(content, "image_content", None)
        if not isinstance(image, bytes) or not 0 < len(image) <= 4 * 1024 * 1024:
            raise web.HTTPNotFound()
        if request.query.get("v") != hashlib.sha256(image).hexdigest()[:16]:
            raise web.HTTPConflict()
        return web.Response(
            body=image, content_type="image/png", headers={"Cache-Control": "private, no-store"}
        )


async def async_register(hass):
    if hass.data.get((DOMAIN, "panel")):
        return
    if hass.http is not None and not hass.data.get((DOMAIN, "static")):
        await hass.http.async_register_static_paths(
            [StaticPathConfig(STATIC, str(BUNDLE), cache_headers=True)]
        )
        hass.http.register_view(MapView(hass))
        hass.data[(DOMAIN, "static")] = True
    await panel_custom.async_register_panel(
        hass,
        frontend_url_path="roborock-companion",
        webcomponent_name="roborock-companion-panel",
        sidebar_title="Roborock",
        sidebar_icon="mdi:robot-vacuum",
        module_url=f"{STATIC}/roborock-companion-panel.js?v={VERSION}",
        require_admin=True,
        config={},
    )
    hass.data[(DOMAIN, "panel")] = True


def async_unregister(hass):
    if hass.data.pop((DOMAIN, "panel"), False):
        frontend.async_remove_panel(hass, "roborock-companion")
