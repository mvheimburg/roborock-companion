import type { Hass, Snapshot, OperationResult, MapSnapshot } from "./types";
export async function snapshot(hass: Hass, entity_id: string) {
  const result = await hass.callWS<Snapshot>({
    type: "roborock_companion/snapshot",
    entity_id,
  });
  if (result.api_version !== 1 || result.entity_id !== entity_id)
    throw new Error("incompatible_api");
  return result;
}
export function execute(
  hass: Hass,
  s: Snapshot,
  operation: string,
  params: Record<string, unknown>,
) {
  return hass.callWS<OperationResult>({
    type: "roborock_companion/execute",
    entity_id: s.entity_id,
    operation,
    params,
    expected_revision: s.revision,
    request_id: crypto.randomUUID(),
  });
}
export interface RegistryEntity {
  entity_id: string;
  device_id?: string;
  platform?: string;
  config_entry_id?: string;
  disabled_by?: string | null;
  hidden_by?: string | null;
}
export async function bindings(hass: Hass, entity_id: string) {
  const entities = await hass.callWS<RegistryEntity[]>({
    type: "config/entity_registry/list",
  });
  const target = entities.find((e) => e.entity_id === entity_id);
  if (!target?.device_id) return [];
  let deviceIds = [target.device_id];
  try {
    const devices = await hass.callWS<{ id: string; via_device_id?: string }[]>(
      { type: "config/device_registry/list" },
    );
    deviceIds = deviceIds.concat(
      devices
        .filter((d) => d.via_device_id === target.device_id)
        .map((d) => d.id),
    );
  } catch {
    /* Non-admins can still configure explicit card bindings. */
  }
  return entities
    .filter(
      (e) =>
        deviceIds.includes(e.device_id || "") &&
        e.platform === "roborock" &&
        !e.disabled_by &&
        !e.hidden_by &&
        (!target.config_entry_id ||
          e.config_entry_id === target.config_entry_id),
    )
    .map((e) => e.entity_id);
}
export async function publicMaps(
  hass: Hass,
  entity_id: string,
): Promise<MapSnapshot[]> {
  const result = await hass.callWS<{
    response: Record<
      string,
      { maps: { flag: number; name: string; rooms: Record<string, string> }[] }
    >;
  }>({
    type: "call_service",
    domain: "roborock",
    service: "get_maps",
    service_data: { entity_id },
    return_response: true,
  });
  return (result.response?.[entity_id]?.maps || []).map((m) => ({
    id: m.flag,
    name: m.name,
    active: false,
    rooms: Object.entries(m.rooms).map(([id, name]) => ({
      id: Number(id),
      name,
    })),
    calibration: null,
    width: 0,
    height: 0,
    image_url: "",
    walls: [],
    no_go: [],
    no_mop: [],
    path: [],
    preservation_complete: false,
    edit_blocker: "geometry_unavailable",
  }));
}
