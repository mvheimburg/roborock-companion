from unittest.mock import patch

from homeassistant.config_entries import SOURCE_USER
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from .helpers import add_robot


async def test_setup_and_cancel_options_keep_binding(hass):
    parent = MockConfigEntry(domain="roborock", data={})
    parent.add_to_hass(hass)
    entity_id, _ = add_robot(hass, parent, "robot")
    result = await hass.config_entries.flow.async_init(
        "roborock_companion", context={"source": SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM
    with patch("custom_components.roborock_companion.async_setup_entry", return_value=True):
        result = await hass.config_entries.flow.async_configure(
            result["flow_id"], {"entity_id": entity_id}
        )
        await hass.async_block_till_done()
    assert result["type"] is FlowResultType.CREATE_ENTRY
    entry = result["result"]
    assert entry.data["entity_id"] == entity_id
    options = await hass.config_entries.options.async_init(entry.entry_id)
    hass.config_entries.options.async_abort(options["flow_id"])
    assert entry.data["entity_id"] == entity_id
    assert not entry.options


async def test_foreign_entity_is_rejected(hass):
    result = await hass.config_entries.flow.async_init(
        "roborock_companion", context={"source": SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {"entity_id": "vacuum.foreign"}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["errors"] == {"base": "invalid_binding"}


async def test_setup_abort_leaves_no_entry(hass):
    result = await hass.config_entries.flow.async_init(
        "roborock_companion", context={"source": SOURCE_USER}
    )
    hass.config_entries.flow.async_abort(result["flow_id"])
    assert not hass.config_entries.async_entries("roborock_companion")
