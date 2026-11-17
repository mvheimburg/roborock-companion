from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.roborock_companion.adapter import RoborockAdapter

from .helpers import add_robot


@pytest.fixture(autouse=True)
def custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture(autouse=True)
def frontend_dependencies(hass):
    # UI rendering is tested separately in browser and panel HTTP tests.
    from pytest_homeassistant_custom_component.common import MockModule, mock_integration

    for domain in ("frontend", "panel_custom"):
        mock_integration(hass, MockModule(domain))


@pytest.fixture
async def adapter(hass):
    entry = MockConfigEntry(domain="roborock", data={"base_url": "https://robot.example.test"})
    entry.add_to_hass(hass)
    entity_id, coordinator = add_robot(hass, entry, "robot", AsyncMock(return_value=[]))
    entry.runtime_data = SimpleNamespace(values=lambda: [coordinator])
    adapter = RoborockAdapter(hass, entity_id)
    await adapter.async_bind()
    yield adapter
    await adapter.async_close()
