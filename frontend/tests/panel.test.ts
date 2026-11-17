import { afterEach, expect, it } from "vitest";
import "../src/panel";
import type { RoborockPanel } from "../src/panel";
import type { Hass, Snapshot } from "../src/shared/types";
const s: Snapshot = {
  api_version: 1,
  entity_id: "vacuum.robot",
  revision: "base",
  available: true,
  updated_at: "2026-11-17T12:00:00Z",
  state: "docked",
  generation: 1,
  current_map: 0,
  connection: {
    local_available: true,
    server_kind: "custom_server",
    command_transport: "ha_managed",
    maps_transport: "configured_server",
  },
  maps: [],
  settings: [
    {
      entity_id: "number.robot_volume",
      kind: "number",
      name: "Volume",
      value: "25",
      min: 0,
      max: 100,
      step: 1,
      available: true,
      options: [],
    },
  ],
  schedules: [],
  capabilities: {},
};
afterEach(() => document.body.replaceChildren());
it("saves only an explicit draft and retains it after rejection", async () => {
  const requests: Record<string, unknown>[] = [];
  const hass: Hass = {
    language: "nb",
    user: { is_admin: true },
    states: {},
    callService: async () => undefined,
    callWS: async <T>(m: Record<string, unknown>) => {
      requests.push(m);
      if (m.type === "roborock_companion/list")
        return { robots: [{ entity_id: "vacuum.robot", name: "Robot" }] } as T;
      if (m.type === "roborock_companion/snapshot")
        return structuredClone(s) as T;
      return { status: "failed", error: "conflict", completed_steps: [] } as T;
    },
  };
  const p = document.createElement("roborock-companion-panel") as RoborockPanel;
  p.hass = hass;
  document.body.append(p);
  await new Promise((r) => setTimeout(r, 50));
  await p.updateComplete;
  (
    p.shadowRoot!.querySelector('[data-tab="settings"]') as HTMLButtonElement
  ).click();
  await p.updateComplete;
  const input = p.shadowRoot!.querySelector(
    'input[type="number"]',
  ) as HTMLInputElement;
  input.value = "40";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await p.updateComplete;
  expect(
    requests.filter((r) => r.type === "roborock_companion/execute"),
  ).toHaveLength(0);
  (
    p.shadowRoot!.querySelector(
      '[data-action="save-settings"]',
    ) as HTMLButtonElement
  ).click();
  await new Promise((r) => setTimeout(r, 30));
  await p.updateComplete;
  const request = requests.find(
    (r) => r.type === "roborock_companion/execute",
  )!;
  expect(request.operation).toBe("settings_save");
  expect(request.params).toEqual({
    changes: [{ entity_id: "number.robot_volume", value: 40 }],
  });
  expect(
    (p.shadowRoot!.querySelector('input[type="number"]') as HTMLInputElement)
      .value,
  ).toBe("40");
  expect(p.shadowRoot!.textContent).toContain("utkastet beholdes");
});

it("finishes a successful save and enables controls again", async () => {
  let server = structuredClone(s);
  const hass: Hass = {
    language: "en",
    user: { is_admin: true },
    states: {},
    callService: async () => undefined,
    callWS: async <T>(m: Record<string, unknown>) => {
      if (m.type === "roborock_companion/list")
        return { robots: [{ entity_id: "vacuum.robot", name: "Robot" }] } as T;
      if (m.type === "roborock_companion/snapshot") return server as T;
      server = {
        ...server,
        revision: "saved",
        settings: [{ ...server.settings[0], value: "35" }],
      };
      return {
        status: "confirmed",
        revision: "saved",
        completed_steps: ["number.robot_volume"],
      } as T;
    },
  };
  const p = document.createElement("roborock-companion-panel") as RoborockPanel;
  p.hass = hass;
  document.body.append(p);
  await new Promise((r) => setTimeout(r, 40));
  (
    p.shadowRoot!.querySelector('[data-tab="settings"]') as HTMLButtonElement
  ).click();
  await p.updateComplete;
  const input = p.shadowRoot!.querySelector(
    'input[type="number"]',
  ) as HTMLInputElement;
  input.value = "35";
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await p.updateComplete;
  (
    p.shadowRoot!.querySelector(
      '[data-action="save-settings"]',
    ) as HTMLButtonElement
  ).click();
  await new Promise((r) => setTimeout(r, 40));
  await p.updateComplete;
  expect(
    (p.shadowRoot!.querySelector('input[type="number"]') as HTMLInputElement)
      .disabled,
  ).toBe(false);
  expect(p.shadowRoot!.textContent).toContain("Changes confirmed");
});
