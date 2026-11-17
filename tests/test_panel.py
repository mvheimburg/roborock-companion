from unittest.mock import AsyncMock, patch

from custom_components.roborock_companion import panel


async def test_panel_is_admin_owned_and_removed_once(hass):
    with (
        patch.object(
            panel.panel_custom, "async_register_panel", new_callable=AsyncMock
        ) as register,
        patch.object(panel.frontend, "async_remove_panel") as remove,
    ):
        await panel.async_register(hass)
        await panel.async_register(hass)
        assert register.await_count == 1
        assert register.await_args.kwargs["require_admin"] is True
        assert register.await_args.kwargs["frontend_url_path"] == "roborock-companion"
        panel.async_unregister(hass)
        panel.async_unregister(hass)
        remove.assert_called_once_with(hass, "roborock-companion")
