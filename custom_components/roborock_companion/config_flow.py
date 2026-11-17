"""Select an existing Roborock; no second login or robot onboarding."""

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.core import callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import selector

from .const import DOMAIN


def binding_schema(entity_id=None):
    return vol.Schema(
        {
            vol.Required(
                "entity_id", description={"suggested_value": entity_id}
            ): selector.EntitySelector({"domain": "vacuum", "integration": "roborock"})
        }
    )


def valid_binding(hass, entity_id):
    entity = er.async_get(hass).async_get(entity_id)
    return entity is not None and entity.platform == "roborock" and entity.domain == "vacuum"


class CompanionConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return CompanionOptionsFlow()

    async def async_step_user(self, user_input=None):
        errors = {}
        if user_input is not None:
            entity_id = user_input["entity_id"]
            if not valid_binding(self.hass, entity_id):
                errors["base"] = "invalid_binding"
            else:
                entity = er.async_get(self.hass).async_get(entity_id)
                await self.async_set_unique_id(entity.id)
                self._abort_if_unique_id_configured()
                state = self.hass.states.get(entity_id)
                name = state.name if state else entity_id
                return self.async_create_entry(
                    title=name, data={"entity_id": entity_id, "device_id": entity.device_id}
                )
        return self.async_show_form(step_id="user", data_schema=binding_schema(), errors=errors)


class CompanionOptionsFlow(config_entries.OptionsFlow):
    async def async_step_init(self, user_input=None):
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({}),
            description_placeholders={"panel_url": "/roborock-companion"},
        )
