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

const pause = () => new Promise((r) => setTimeout(r, 40));
function button(p: RoborockPanel, text: string) {
  return [...p.shadowRoot!.querySelectorAll("button")].find(
    (b) => b.textContent?.trim() === text,
  ) as HTMLButtonElement;
}
async function mapPanel(status = "confirmed") {
  const requests: Record<string, unknown>[] = [],
    calls: unknown[] = [];
  const state = structuredClone(s);
  state.maps = [
    {
      id: 0,
      name: "Floor",
      active: true,
      rooms: [{ id: 16, name: "Room A" }],
      calibration: [
        { map: { x: 0, y: 0 }, vacuum: { x: 0, y: 0 } },
        { map: { x: 100, y: 0 }, vacuum: { x: 100, y: 0 } },
        { map: { x: 0, y: 100 }, vacuum: { x: 0, y: 100 } },
      ],
      width: 100,
      height: 100,
      image_url: "",
      walls: [],
      no_go: [],
      no_mop: [],
      path: [],
      preservation_complete: true,
    },
  ];
  state.capabilities = {
    map_restrictions_save: { status: "available" },
    map_goto: { status: "available" },
  };
  const h: Hass = {
    language: "en",
    user: { is_admin: true },
    states: {},
    callService: async (...args) => {
      calls.push(args);
    },
    callWS: async <T>(m: Record<string, unknown>) => {
      requests.push(m);
      if (m.type === "roborock_companion/list")
        return {
          robots: [
            { entity_id: "vacuum.robot", name: "A" },
            { entity_id: "vacuum.second", name: "B" },
          ],
        } as T;
      if (m.type === "roborock_companion/snapshot")
        return { ...structuredClone(state), entity_id: m.entity_id } as T;
      if (status === "partial" && m.operation === "settings_save") {
        state.settings[0].value = "40";
        return {
          status: "failed",
          revision: "after",
          completed_steps: [state.settings[0].entity_id],
          error: "request_failed",
        } as T;
      }
      return {
        status,
        revision: "after",
        completed_steps: [],
        error: "timeout",
      } as T;
    },
  };
  const p = document.createElement("roborock-companion-panel") as RoborockPanel;
  p.hass = h;
  document.body.append(p);
  await pause();
  return { p, requests, calls, state };
}
async function wallDraft(p: RoborockPanel) {
  const select = [...p.shadowRoot!.querySelectorAll("select")].find((e) =>
    [...e.options].some((o) => o.value === "wall"),
  )!;
  select.value = "wall";
  select.dispatchEvent(new Event("change"));
  await p.updateComplete;
  const map = p.shadowRoot!.querySelector("roborock-map")!;
  for (const point of [
    { x: 10, y: 10 },
    { x: 20, y: 20 },
  ]) {
    map.dispatchEvent(new CustomEvent("map-point", { detail: point }));
    await p.updateComplete;
  }
  button(p, "Add to draft").click();
  await p.updateComplete;
}
it("clears room selections and coordinates when switching robots", async () => {
  const { p } = await mapPanel();
  button(p, "Room A").click();
  await p.updateComplete;
  const map = p.shadowRoot!.querySelector("roborock-map")!;
  map.dispatchEvent(new CustomEvent("map-point", { detail: { x: 30, y: 40 } }));
  await p.updateComplete;
  const robots = p.shadowRoot!.querySelector("select")!;
  robots.value = "vacuum.second";
  robots.dispatchEvent(new Event("change"));
  await pause();
  await p.updateComplete;
  expect(button(p, "Clean selected rooms").disabled).toBe(true);
  expect(
    (
      p.shadowRoot!.querySelector("roborock-map") as unknown as {
        points: unknown[];
      }
    ).points,
  ).toEqual([]);
});
it("uses map-qualified public room cleaning", async () => {
  const { p, calls } = await mapPanel();
  button(p, "Room A").click();
  await p.updateComplete;
  button(p, "Clean selected rooms").click();
  await pause();
  expect(calls).toContainEqual([
    "vacuum",
    "clean_segments",
    { entity_id: "vacuum.robot", segment_ids: ["0_16"] },
  ]);
});
it("preserves a wall draft after saving a room display name", async () => {
  const { p } = await mapPanel();
  await wallDraft(p);
  button(p, "Room A").click();
  await p.updateComplete;
  const name = p.shadowRoot!.querySelector(
    'input[type="text"]',
  ) as HTMLInputElement;
  name.value = "New display";
  name.dispatchEvent(new Event("input"));
  await p.updateComplete;
  button(p, "Save room name").click();
  await pause();
  await p.updateComplete;
  expect(
    (
      p.shadowRoot!.querySelector("roborock-map") as unknown as {
        map: { walls: unknown[] };
      }
    ).map.walls,
  ).toHaveLength(1);
});
it("read-only reconciliation preserves an uncertain draft", async () => {
  const { p, requests } = await mapPanel("unconfirmed");
  await wallDraft(p);
  (
    [...p.shadowRoot!.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Save changes" && !b.disabled,
    ) as HTMLButtonElement
  ).click();
  await p.updateComplete;
  await pause();
  const dialog = p.shadowRoot!.querySelector("dialog")!;
  (
    [...dialog.querySelectorAll("button")].find(
      (e) => e.textContent?.trim() === "Confirm",
    ) as HTMLButtonElement
  ).click();
  await pause();
  await p.updateComplete;
  const refresh = [...p.shadowRoot!.querySelectorAll("button")].find(
    (e) => e.textContent?.trim() === "Refresh" && !e.disabled,
  )!;
  expect(refresh).toBeDefined();
  refresh.click();
  await pause();
  await p.updateComplete;
  expect(
    requests.filter((m) => m.type === "roborock_companion/snapshot").length,
  ).toBeGreaterThan(1);
  expect(
    (
      p.shadowRoot!.querySelector("roborock-map") as unknown as {
        map: { walls: unknown[] };
      }
    ).map.walls,
  ).toHaveLength(1);
});

it("identifies and keeps only outstanding settings after a partial save", async () => {
  const { p, state, requests } = await mapPanel("partial");
  state.settings.push({
    ...state.settings[0],
    entity_id: "number.robot_other",
    name: "Other volume",
  });
  (p.shadowRoot!.querySelector("select") as HTMLSelectElement).dispatchEvent(
    new Event("change"),
  );
  await pause();
  (
    p.shadowRoot!.querySelector('[data-tab="settings"]') as HTMLButtonElement
  ).click();
  await p.updateComplete;
  const inputs = [...p.shadowRoot!.querySelectorAll('input[type="number"]')];
  for (const input of inputs) {
    (input as HTMLInputElement).value = "40";
    input.dispatchEvent(new Event("input"));
  }
  await p.updateComplete;
  (
    p.shadowRoot!.querySelector(
      '[data-action="save-settings"]',
    ) as HTMLButtonElement
  ).click();
  await pause();
  await p.updateComplete;
  expect(p.shadowRoot!.textContent).toContain("Other volume");
  (
    p.shadowRoot!.querySelector(
      '[data-action="save-settings"]',
    ) as HTMLButtonElement
  ).click();
  await pause();
  const attempts = requests.filter(
    (m) => m.type === "roborock_companion/execute",
  );
  expect(attempts.at(-1)!.params).toEqual({
    changes: [{ entity_id: "number.robot_other", value: 40 }],
  });
});
it("renders official button-backed dock actions", async () => {
  const { p, state, calls } = await mapPanel();
  state.settings = [
    {
      entity_id: "button.robot_empty",
      kind: "button",
      name: "Empty bin",
      value: "unknown",
      available: true,
      options: [],
      min: 0,
      max: 0,
      step: 1,
    } as unknown as Snapshot["settings"][number],
  ];
  (p.shadowRoot!.querySelector("select") as HTMLSelectElement).dispatchEvent(
    new Event("change"),
  );
  await pause();
  (
    p.shadowRoot!.querySelector('[data-tab="settings"]') as HTMLButtonElement
  ).click();
  await p.updateComplete;
  button(p, "Empty bin").click();
  await pause();
  expect(calls).toContainEqual([
    "button",
    "press",
    { entity_id: "button.robot_empty" },
  ]);
});
it("discarding a draft does not clear an unconfirmed physical operation", async () => {
  const { p } = await mapPanel("unconfirmed");
  await wallDraft(p);
  (
    [...p.shadowRoot!.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Save changes" && !b.disabled,
    ) as HTMLButtonElement
  ).click();
  await pause();
  const dialog = p.shadowRoot!.querySelector("dialog")!;
  (
    [...dialog.querySelectorAll("button")].find(
      (e) => e.textContent?.trim() === "Confirm",
    ) as HTMLButtonElement
  ).click();
  await pause();
  (
    [...p.shadowRoot!.querySelectorAll("button")].find(
      (b) => b.textContent?.trim() === "Cancel" && !b.closest("dialog"),
    ) as HTMLButtonElement
  ).click();
  await p.updateComplete;
  (
    p.shadowRoot!.querySelector('[data-tab="settings"]') as HTMLButtonElement
  ).click();
  await p.updateComplete;
  expect(
    (p.shadowRoot!.querySelector('input[type="number"]') as HTMLInputElement)
      .disabled,
  ).toBe(true);
  expect(p.shadowRoot!.textContent).toContain("Refresh");
});
