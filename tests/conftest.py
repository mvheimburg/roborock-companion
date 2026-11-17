import pytest


@pytest.fixture(autouse=True)
def custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture(autouse=True)
def frontend_dependencies(hass):
    # UI rendering is tested separately in browser and panel HTTP tests.
    from pytest_homeassistant_custom_component.common import MockModule, mock_integration

    for domain in ("frontend", "panel_custom"):
        mock_integration(hass, MockModule(domain))
