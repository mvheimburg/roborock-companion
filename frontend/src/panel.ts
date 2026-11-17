import { LitElement, html, nothing } from "lit";
import { live } from "lit/directives/live.js";
import type {
  Hass,
  Snapshot,
  Setting,
  MapSnapshot,
  Point,
  OperationResult,
} from "./shared/types";
import {
  strings,
  number,
  locale,
  errorText,
  optionLabel,
  type TextKey,
} from "./shared/i18n";
import { styles } from "./shared/styles";
import { snapshot, execute } from "./shared/api";
import "./shared/map-view";

type Tab = "maps" | "settings" | "schedules" | "history";
interface CleaningRecord {
  id: number;
  begin: number | null;
  duration: number | null;
  area: number | null;
  error?: number;
}

type Tool = "view" | "wall" | "noGo" | "split" | "goTo" | "zone";
export class RoborockPanel extends LitElement {
  static properties = {
    robots: { state: true },
    entity: { state: true },
    data: { state: true },
    tab: { state: true },
    pending: { state: true },
    loading: { state: true },
    error: { state: true },
    message: { state: true },
    selected: { state: true },
    tool: { state: true },
    points: { state: true },
    draft: { state: true },
    mapDraft: { state: true },
    floorId: { state: true },
    confirmation: { state: true },
    uncertain: { state: true },
    records: { state: true },
    historyOffset: { state: true },
    historyTotal: { state: true },
    historyNext: { state: true },
    roomName: { state: true },
  };
  static styles = styles;
  private ha?: Hass;
  private initialized = false;
  private epoch = 0;
  private unsubscribe?: () => void;
  private robots: { entity_id: string; name: string }[] = [];
  private entity = "";
  private data?: Snapshot;
  private tab: Tab = "maps";
  private pending = false;
  private loading = false;
  private error = "";
  private message = "";
  private selected: number[] = [];
  private tool: Tool = "view";
  private points: Point[] = [];
  private draft: Record<string, unknown> = {};
  private draftRevision = "";
  private mapDraft?: MapSnapshot;
  private floorId?: number;
  private confirmation?: {
    text: string;
    action: () => void;
    readonly?: boolean;
  };
  private uncertainRobots = new Set<string>();
  private interactionRevision = "";
  private uncertain = false;
  private records: {
    id: number;
    begin: number | null;
    duration: number | null;
    area: number | null;
    error?: number;
  }[] = [];
  private historyOffset = 0;
  private historyNext: number | null = null;
  private historyTotal = 0;
  private roomName = "";
  private material = 3;
  private direction = -1;
  get hass() {
    return this.ha;
  }
  set hass(value: Hass | undefined) {
    this.ha = value;
    if (value && this.isConnected && !this.initialized) void this.initialize();
    this.requestUpdate();
  }
  connectedCallback() {
    super.connectedCallback();
    window.addEventListener("beforeunload", this.beforeUnload);
    if (this.ha && !this.initialized) void this.initialize();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.epoch++;
    this.initialized = false;
    this.unsubscribe?.();
    window.removeEventListener("beforeunload", this.beforeUnload);
  }
  private beforeUnload = (event: BeforeUnloadEvent) => {
    if (this.dirty) {
      event.preventDefault();
      event.returnValue = "";
    }
  };
  private get dirty() {
    return (
      !!Object.keys(this.draft).length || !!this.mapDraft || !!this.roomName
    );
  }
  private get map() {
    return (
      this.mapDraft ||
      this.data?.maps.find(
        (m) => m.id === (this.floorId ?? this.data?.current_map),
      ) ||
      this.data?.maps[0]
    );
  }
  private get canAct() {
    return (
      !!this.ha?.user?.is_admin &&
      !!this.data?.available &&
      !this.pending &&
      !this.loading &&
      !this.uncertain
    );
  }
  private async initialize() {
    const h = this.ha;
    if (!h) return;
    this.initialized = true;
    this.loading = true;
    const epoch = ++this.epoch;
    try {
      const list = await h.callWS<{
        robots: { entity_id: string; name: string }[];
      }>({ type: "roborock_companion/list" });
      if (epoch !== this.epoch) return;
      this.robots = list.robots;
      const desired = new URLSearchParams(window.location.search).get(
        "entity_id",
      );
      this.entity =
        this.robots.find((r) => r.entity_id === desired)?.entity_id ||
        this.robots[0]?.entity_id ||
        "";
      if (this.entity) await this.load();
    } catch {
      if (epoch === this.epoch) this.error = strings(h).failed;
    } finally {
      if (epoch === this.epoch) this.loading = false;
    }
  }
  private async load(reconcile = false) {
    if (!this.ha || !this.entity) return;
    const epoch = ++this.epoch,
      id = this.entity;
    this.unsubscribe?.();
    this.unsubscribe = undefined;
    this.loading = true;
    try {
      const value = await snapshot(this.ha, id);
      if (epoch !== this.epoch) return;
      this.data = value;
      this.floorId = value.current_map ?? value.maps[0]?.id;
      if (reconcile && value.available) {
        this.uncertain = false;
        this.uncertainRobots.delete(id);
        this.error = "";
        this.message = strings(this.ha).reconciled;
        if (!this.mapDraft) this.draftRevision = value.revision;
      }
      if (!this.dirty) this.draftRevision = value.revision;
      if (this.ha.connection) {
        const unsub = await this.ha.connection.subscribeMessage<Snapshot>(
          (s) => {
            if (
              epoch === this.epoch &&
              s.entity_id === id &&
              s.api_version === 1
            ) {
              if (this.data?.current_map !== s.current_map) {
                this.selected = [];
                this.points = [];
                this.tool = "view";
                this.interactionRevision = "";
              }
              this.data = s;
              if (!this.dirty) this.draftRevision = s.revision;
            }
          },
          { type: "roborock_companion/subscribe", entity_id: id },
        );
        if (epoch === this.epoch) this.unsubscribe = unsub;
        else unsub();
      }
    } catch {
      if (epoch === this.epoch) this.error = strings(this.ha).failed;
    } finally {
      if (epoch === this.epoch) this.loading = false;
    }
  }
  private resetDraft() {
    this.draft = {};
    this.roomName = "";
    this.mapDraft = undefined;
    this.points = [];
    this.selected = [];
    this.tool = "view";
    this.interactionRevision = "";
    this.draftRevision = this.data?.revision || "";
    this.error = this.uncertain ? strings(this.ha).unconfirmed : "";
    this.message = "";
  }
  private guard(action: () => void) {
    if (this.pending) return;
    if (!this.dirty) {
      action();
      return;
    }
    this.confirmation = {
      text: strings(this.ha).discardHelp,
      readonly: true,
      action: () => {
        this.resetDraft();
        this.closeConfirmation();
        action();
      },
    };
    void this.showConfirmation();
  }
  private async showConfirmation() {
    await this.updateComplete;
    this.renderRoot.querySelector<HTMLDialogElement>("#confirm")?.showModal();
  }
  private closeConfirmation() {
    this.renderRoot.querySelector<HTMLDialogElement>("#confirm")?.close();
    this.confirmation = undefined;
  }
  private confirm(text: string, action: () => void) {
    this.confirmation = { text, action };
    void this.showConfirmation();
  }
  private setDraft(field: Setting, value: unknown) {
    if (!this.dirty) this.draftRevision = this.data!.revision;
    this.draft = { ...this.draft, [field.entity_id]: value };
    this.message = "";
  }
  private async run(
    operation: string,
    params: Record<string, unknown>,
    revision = this.draftRevision,
  ) {
    if (!this.canAct || !this.ha || !this.data) return;
    const epoch = this.epoch;
    this.pending = true;
    this.error = "";
    this.message = "";
    try {
      const result = await execute(
        this.ha,
        { ...this.data, revision: revision || this.data.revision },
        operation,
        params,
      );
      if (epoch !== this.epoch) return;
      await this.handleResult(result, operation);
    } catch {
      if (epoch === this.epoch) {
        this.error = strings(this.ha).unconfirmed;
        this.uncertain = true;
        this.uncertainRobots.add(this.entity);
      }
    } finally {
      if (this.isConnected) this.pending = false;
    }
  }
  private async handleResult(result: OperationResult, operation: string) {
    const t = strings(this.ha);
    if (result.status === "confirmed") {
      if (operation === "settings_save") this.draft = {};
      else if (operation === "room_display_save") this.roomName = "";
      else if (operation === "map_restrictions_save") this.mapDraft = undefined;
      this.message = t.confirmed;
      this.closeConfirmation();
      if (this.data) this.data = { ...this.data, revision: result.revision };
      if (
        result.data &&
        typeof result.data === "object" &&
        "records" in result.data
      ) {
        const page = result.data as {
          records: CleaningRecord[];
          offset: number;
          total: number;
          next_offset: number | null;
        };
        this.records = page.records;
        this.historyOffset = page.offset;
        this.historyTotal = page.total;
        this.historyNext = page.next_offset;
      }
      await this.load();
    } else {
      this.error = result.completed_steps.length
        ? t.partial
        : errorText(this.ha, result.error);
      if (result.status === "unconfirmed" || result.status === "pending") {
        this.uncertain = true;
        this.uncertainRobots.add(this.entity);
        this.error = t.unconfirmed;
        this.closeConfirmation();
      }
      if (operation === "settings_save" && result.completed_steps.length) {
        await this.load();
        this.draft = Object.fromEntries(
          Object.entries(this.draft).filter(([id, desired]) => {
            const field = this.data?.settings.find((f) => f.entity_id === id);
            if (!field?.available) return true;
            return field.kind === "number"
              ? Number(field.value) !== Number(desired)
              : field.value !== desired;
          }),
        );
        if (!this.mapDraft)
          this.draftRevision = this.data?.revision || this.draftRevision;
        const names = Object.keys(this.draft).map(
          (id) =>
            this.data?.settings.find((f) => f.entity_id === id)?.name || id,
        );
        this.error =
          (this.uncertain ? t.unconfirmed : t.partial) +
          (names.length ? " " + t.remaining + " " + names.join(", ") : "");
      }
    }
  }
  private saveSettings() {
    void this.run("settings_save", {
      changes: Object.entries(this.draft).map(([entity_id, value]) => ({
        entity_id,
        value,
      })),
    });
  }
  private addPoint(point: Point) {
    if (!this.canAct) return;
    if (!this.points.length) this.interactionRevision = this.data!.revision;
    this.points = this.points.length >= 2 ? [point] : [...this.points, point];
  }
  private addGeometry() {
    if (this.points.length !== 2 || !this.map) return;
    const [a, b] = this.points;
    if (a.x === b.x && a.y === b.y) {
      this.error = strings(this.ha).invalid;
      return;
    }
    if (!this.dirty) this.draftRevision = this.data!.revision;
    const base = this.mapDraft || structuredClone(this.map);
    if (this.tool === "wall")
      base.walls = [...base.walls, [a.x, a.y, b.x, b.y]];
    else if (this.tool === "noGo") {
      const x1 = Math.min(a.x, b.x),
        x2 = Math.max(a.x, b.x),
        y1 = Math.min(a.y, b.y),
        y2 = Math.max(a.y, b.y);
      base.no_go = [...base.no_go, [x1, y1, x1, y2, x2, y2, x2, y1]];
    }
    this.mapDraft = base;
    this.points = [];
  }
  private mapSave() {
    if (!this.mapDraft) return;
    const m = this.mapDraft;
    this.confirm(
      strings(this.ha).confirmMap,
      () =>
        void this.run("map_restrictions_save", {
          map_id: m.id,
          walls: m.walls,
          no_go: m.no_go,
        }),
    );
  }
  private mapOperation(operation: string, params: Record<string, unknown>) {
    if (!this.map) return;
    this.confirm(
      strings(this.ha).confirmPhysical,
      () =>
        void this.run(
          operation,
          { map_id: this.map!.id, ...params },
          this.interactionRevision || this.data!.revision,
        ),
    );
  }
  private cap(operation: string) {
    return this.data?.capabilities[operation]?.status === "available";
  }
  private roomSelect(id: number) {
    if (!this.selected.length) this.interactionRevision = this.data!.revision;
    this.selected = this.selected.includes(id)
      ? this.selected.filter((r) => r !== id)
      : [...this.selected, id];
  }
  private setting(field: Setting) {
    if (field.kind === "button")
      return html`<button
        type="button"
        ?disabled=${!field.available || !this.canAct}
        @click=${() => void this.publicAction("button", "press", { entity_id: field.entity_id })}
      >
        ${field.name}
      </button>`;
    const value = this.draft[field.entity_id] ?? field.value;
    return html`<label
      >${field.name}${field.unit ? html`<small>${field.unit}</small>` : nothing}${
        field.kind === "select"
          ? html`<select
              .value=${live(String(value))}
              ?disabled=${!field.available || !this.canAct}
              @change=${(e: Event) => this.setDraft(field, (e.target as HTMLSelectElement).value)}
            >
              ${field.options.map((option) => html`<option value=${option}>${optionLabel(this.ha, option)}</option>`)}
            </select>`
          : field.kind === "switch"
            ? html`<input
                type="checkbox"
                .checked=${Boolean(value)}
                ?disabled=${!field.available || !this.canAct}
                @change=${(e: Event) => this.setDraft(field, (e.target as HTMLInputElement).checked)}
              />`
            : html`<input
                type=${field.kind === "number" ? "number" : "time"}
                .value=${live(String(value))}
                min=${field.min ?? nothing}
                max=${field.max ?? nothing}
                step=${field.step ?? 1}
                ?disabled=${!field.available || !this.canAct}
                @input=${(e: Event) => this.setDraft(field, field.kind === "number" ? Number((e.target as HTMLInputElement).value) : (e.target as HTMLInputElement).value)}
              />`
      }</label
    >`;
  }
  private settingsView() {
    const t = strings(this.ha);
    return html`<section class="surface">
      <h2>${t.settings}</h2>
      <p class="hint">${t.settingsHelp}</p>
      <form
        novalidate
        @submit=${(e: Event) => {
          e.preventDefault();
          this.saveSettings();
        }}
      >
        <div class="fields">
          ${this.data?.settings.length ? this.data.settings.map((f) => this.setting(f)) : html`<p>${t.noSettings}</p>`}
        </div>
        <div class="actions">
          <button
            class="primary"
            type="submit"
            data-action="save-settings"
            ?disabled=${!this.canAct || !Object.keys(this.draft).length}
          >
            ${t.save}</button
          ><button
            type="button"
            ?disabled=${this.pending || !this.dirty}
            @click=${() => this.resetDraft()}
          >
            ${t.cancel}
          </button>
        </div>
      </form>
    </section>`;
  }
  private coordinateInputs() {
    const t = strings(this.ha);
    return html`<p class="hint">${t.drawHelp}</p>
      <div class="fields">
        ${(["x1", "y1", "x2", "y2"] as const).map((key, index) => {
          const i = Math.floor(index / 2),
            axis = index % 2 ? "y" : "x";
          return html`<label
            >${t[key]}<input
              type="number"
              inputmode="numeric"
              min="0"
              max="51200"
              step="1"
              .value=${this.points[i]?.[axis] === undefined ? "" : String(this.points[i][axis])}
              ?disabled=${!this.canAct}
              @input=${(e: Event) => {
                const value = Number((e.target as HTMLInputElement).value);
                if (!Number.isInteger(value) || value < 0 || value > 51200) {
                  this.error = t.invalid;
                  return;
                }
                if (!this.points.length)
                  this.interactionRevision = this.data!.revision;
                const points = [...this.points];
                points[i] = { ...(points[i] || { x: 0, y: 0 }), [axis]: value };
                this.points = points;
              }}
          /></label>`;
        })}
      </div>`;
  }
  private roomNameView() {
    const t = strings(this.ha),
      room = this.map?.rooms.find((r) => r.id === this.selected[0]);
    if (this.selected.length !== 1 || !room) return nothing;
    return html`<form
      novalidate
      @submit=${(e: Event) => {
        e.preventDefault();
        void this.run("room_display_save", {
          map_id: this.map!.id,
          room_id: room.id,
          name: this.roomName,
        });
      }}
    >
      <label
        >${t.rename}<input
          type="text"
          maxlength="80"
          .value=${live(this.roomName || room.name)}
          ?disabled=${!this.canAct}
          @input=${(e: Event) => {
            if (!this.dirty) this.draftRevision = this.data!.revision;
            this.roomName = (e.target as HTMLInputElement).value;
          }} /></label
      ><button type="submit" ?disabled=${!this.canAct || !this.roomName.trim()}>
        ${t.saveRoom}
      </button>
    </form>`;
  }
  private restrictionsView() {
    const m = this.map,
      t = strings(this.ha);
    if (!m) return nothing;
    return html`${(
      [
        ["walls", "wall"],
        ["no_go", "noGo"],
      ] as const
    ).map(
      ([key, label]) =>
        html`<details>
          <summary>${t[label]} (${m[key]?.length || 0})</summary>
          ${m[key]?.map(
            (_, index) =>
              html`<div class="actions">
                <span>${t[label]} ${number(this.ha, index + 1, 0)}</span
                ><button
                  type="button"
                  ?disabled=${!this.canAct || !m.active || !this.cap("map_restrictions_save")}
                  @click=${() => {
                    if (!this.dirty) this.draftRevision = this.data!.revision;
                    const draft = structuredClone(this.map!);
                    draft[key] = draft[key].filter((_, i) => i !== index);
                    this.mapDraft = draft;
                  }}
                >
                  ${t.remove}
                </button>
              </div>`,
          )}
        </details>`,
    )}`;
  }
  private mapsView() {
    const t = strings(this.ha),
      m = this.map;
    return html`<div class="workspace">
      <section class="surface">
        <header>
          <h2>${t.maps}</h2>
          <button
            type="button"
            ?disabled=${this.pending || this.loading || !this.data?.available}
            @click=${() => (this.uncertain ? void this.load(true) : void this.run("map_refresh", {}, this.data!.revision))}
          >
            ${t.refresh}
          </button>
        </header>
        <p class="hint">${t.roomHelp}</p>
        ${
          this.data?.maps.length
            ? html`<label
                >${t.chooseMap}<select
                  .value=${String(m?.id ?? "")}
                  @change=${(e: Event) => {
                    const select = e.target as HTMLSelectElement,
                      next = Number(select.value);
                    select.value = String(m?.id ?? "");
                    this.guard(() => {
                      this.floorId = next;
                      this.selected = [];
                      this.points = [];
                    });
                  }}
                >
                  ${this.data.maps.map((map) => html`<option value=${map.id}>${map.name}${map.active ? " •" : ""}</option>`)}
                </select></label
              >`
            : nothing
        }<roborock-map
          .hass=${this.ha}
          .map=${m}
          .selected=${this.selected}
          .points=${this.points}
          .pointMode=${this.tool !== "view"}
          .disabled=${!this.canAct || !m?.active}
          @room-select=${(e: CustomEvent<number>) => this.roomSelect(e.detail)}
          @map-point=${(e: CustomEvent<Point>) => this.addPoint(e.detail)}
        ></roborock-map
        >${this.tool !== "view" ? this.coordinateInputs() : nothing}
      </section>
      <aside class="sidebar">
        <section class="surface">
          <h3>${t.rooms}</h3>
          ${this.roomNameView()}
          <div class="room-list">
            ${m?.rooms.length ? m.rooms.map((room) => html`<button type="button" aria-pressed=${String(this.selected.includes(room.id))} @click=${() => this.roomSelect(room.id)}>${room.name}</button>`) : html`<p class="hint">${t.noRooms}</p>`}
          </div>
          <div class="actions">
            <button
              type="button"
              ?disabled=${!this.canAct || !m?.active || !this.selected.length}
              @click=${() => void this.publicAction("vacuum", "clean_segments", { entity_id: this.entity, segment_ids: this.selected.map((id) => `${m!.id}_${id}`) })}
            >
              ${t.cleanRooms}
            </button>
          </div>
        </section>
        <section class="surface section">
          <h3>${t.advanced}</h3>
          ${!this.cap("map_restrictions_save") && !this.cap("room_split") ? html`<p class="hint">${t.modelUnverified}</p>` : nothing}
          <label
            >${t.advanced}<select
              .value=${this.tool}
              @change=${(e: Event) => {
                this.tool = (e.target as HTMLSelectElement).value as Tool;
                this.points = [];
              }}
            >
              ${(["view", "wall", "noGo", "split", "goTo", "zone"] as Tool[]).map((tool) => html`<option value=${tool} ?disabled=${!m?.active || (tool !== "view" && !m.calibration) || (["goTo", "zone"].includes(tool) && !this.cap(tool === "goTo" ? "map_goto" : "map_zone_clean")) || (["wall", "noGo"].includes(tool) && !this.cap("map_restrictions_save")) || (tool === "split" && !this.cap("room_split"))}>${t[tool as TextKey]}</option>`)}
            </select></label
          >${this.restrictionsView()}${m?.edit_blocker ? html`<p class="hint">${t.preservation}</p>` : nothing}${this.tool === "wall" || this.tool === "noGo" ? html`<button type="button" ?disabled=${!this.canAct || this.points.length !== 2} @click=${() => this.addGeometry()}>${t.add}</button>` : this.tool === "split" ? html`<button type="button" ?disabled=${!this.canAct || this.points.length !== 2 || this.selected.length !== 1 || !this.cap("room_split")} @click=${() => this.mapOperation("room_split", { room_id: this.selected[0], line: [this.points[0].x, this.points[0].y, this.points[1].x, this.points[1].y] })}>${t.split}</button>` : this.tool === "goTo" ? html`<button type="button" ?disabled=${!this.canAct || !this.points.length || !m?.active || !this.cap("map_goto")} @click=${() => void this.run("map_goto", { map_id: m!.id, ...this.points[0] }, this.interactionRevision)}>${t.goTo}</button>` : this.tool === "zone" ? html`<button type="button" ?disabled=${!this.canAct || this.points.length !== 2 || !m?.active || !this.cap("map_zone_clean")} @click=${() => void this.run("map_zone_clean", { map_id: m!.id, x1: Math.min(this.points[0].x, this.points[1].x), y1: Math.min(this.points[0].y, this.points[1].y), x2: Math.max(this.points[0].x, this.points[1].x), y2: Math.max(this.points[0].y, this.points[1].y), repeats: 1 }, this.interactionRevision)}>${t.zone}</button>` : nothing}
          <div class="actions">
            <button
              type="button"
              ?disabled=${!this.canAct || this.selected.length !== 2 || !this.cap("room_merge")}
              @click=${() => this.mapOperation("room_merge", { rooms: this.selected })}
            >
              ${t.merge}
            </button>
          </div>
          <label
            >${t.material}<select
              @change=${(e: Event) => (this.material = Number((e.target as HTMLSelectElement).value))}
            >
              <option value="3">${t.wood}</option>
              <option value="4">${t.tile}</option>
            </select></label
          ><label
            >${t.direction}<input
              type="number"
              min="-1"
              max="359"
              value="-1"
              @input=${(e: Event) => (this.direction = Number((e.target as HTMLInputElement).value))} /></label
          ><button
            type="button"
            ?disabled=${!this.canAct || this.selected.length !== 1 || !this.cap("floor_material")}
            @click=${() => this.mapOperation("floor_material", { room_id: this.selected[0], material: this.material, direction: this.material === 3 ? this.direction : -1 })}
          >
            ${t.save}</button
          >${
            this.mapDraft
              ? html`<div class="section">
                  <strong>${t.dirty}</strong>
                  <p>
                    ${t.wall}: ${this.mapDraft.walls.length} · ${t.noGo}:
                    ${this.mapDraft.no_go.length}
                  </p>
                  <div class="actions">
                    <button
                      type="button"
                      class="primary"
                      ?disabled=${!this.canAct}
                      @click=${() => this.mapSave()}
                    >
                      ${t.save}</button
                    ><button
                      type="button"
                      ?disabled=${this.pending}
                      @click=${() => this.resetDraft()}
                    >
                      ${t.cancel}
                    </button>
                  </div>
                </div>`
              : nothing
          }
        </section>
        <section class="surface section">
          <h3>${t.map}</h3>
          ${(
            [
              ["map_backup", "backup"],
              ["map_restore", "restore"],
              ["map_build", "buildMap"],
            ] as const
          ).map(
            ([operation, label]) =>
              html`<div class="actions">
                <button
                  type="button"
                  ?disabled=${!this.canAct || !m?.active || !this.cap(operation)}
                  @click=${() => this.mapOperation(operation, { confirm: true })}
                >
                  ${t[label]}
                </button>
              </div>`,
          )}
        </section>
      </aside>
    </div>`;
  }
  private async publicAction(
    domain: string,
    service: string,
    data: Record<string, unknown>,
  ) {
    if (
      !this.canAct ||
      !this.ha ||
      (service === "clean_segments" && !this.map?.active)
    )
      return;
    this.pending = true;
    this.error = "";
    const epoch = this.epoch;
    try {
      await this.ha.callService(domain, service, data);
    } catch {
      if (epoch === this.epoch) this.error = strings(this.ha).failed;
    } finally {
      if (this.isConnected) this.pending = false;
    }
  }
  private sessionDate(value: number | null) {
    if (value === null || !Number.isFinite(value))
      return strings(this.ha).unknown;
    try {
      return new Intl.DateTimeFormat(locale(this.ha), {
        dateStyle: "medium",
        timeStyle: "short",
        hour12:
          this.ha?.locale?.time_format === "12"
            ? true
            : this.ha?.locale?.time_format === "24"
              ? false
              : undefined,
      }).format(new Date(value * 1000));
    } catch {
      return strings(this.ha).unknown;
    }
  }
  private historyView() {
    const t = strings(this.ha);
    return html`<section class="surface">
      <header>
        <h2>${t.history}</h2>
        <button
          type="button"
          ?disabled=${!this.canAct}
          @click=${() => void this.run("history_read", { offset: 0, limit: 5 }, this.data!.revision)}
        >
          ${t.loadHistory}
        </button>
      </header>
      ${this.records.length ? this.records.map((r) => html`<div class="history-row"><span>${this.sessionDate(r.begin)}</span><span>${r.duration === null ? t.unknown : number(this.ha, r.duration / 60)} min · ${r.area === null ? t.unknown : number(this.ha, r.area / 1000000)} m²</span></div>`) : html`<p class="hint">${t.emptyHistory}</p>`}
      <nav class="actions" aria-label=${t.history}>
        <button
          type="button"
          ?disabled=${!this.canAct || this.historyOffset === 0}
          @click=${() => void this.run("history_read", { offset: Math.max(0, this.historyOffset - 5), limit: 5 }, this.data!.revision)}
        >
          ${t.previous}</button
        ><span>${number(this.ha, this.historyTotal, 0)}</span
        ><button
          type="button"
          ?disabled=${!this.canAct || this.historyNext === null}
          @click=${() => void this.run("history_read", { offset: this.historyNext, limit: 5 }, this.data!.revision)}
        >
          ${t.next}
        </button>
      </nav>
    </section>`;
  }
  render() {
    const t = strings(this.ha);
    return html`<main class="panel">
      <header>
        <div>
          <h1>Roborock</h1>
          <p class="hint">
            ${this.data?.connection.server_kind === "custom_server" ? t.serverLocal : this.data?.connection.server_kind === "roborock_cloud" ? t.serverCloud : ""}
          </p>
        </div>
        <a
          class="button"
          href="/config/integrations/integration/roborock_companion"
          >${t.setup}</a
        >
      </header>
      ${this.loading ? html`<p role="status">${t.loading}</p>` : nothing}${!this.robots.length && !this.loading ? html`<p>${t.noRobots}</p>` : nothing}${
        this.robots.length
          ? html`<label
              >${t.selectRobot}<select
                .value=${this.entity}
                @change=${(e: Event) => {
                  const el = e.target as HTMLSelectElement,
                    value = el.value;
                  el.value = this.entity;
                  this.guard(() => {
                    this.resetDraft();
                    this.entity = value;
                    this.uncertain = this.uncertainRobots.has(value);
                    this.floorId = undefined;
                    this.data = undefined;
                    this.records = [];
                    void this.load();
                  });
                }}
              >
                ${this.robots.map((r) => html`<option value=${r.entity_id}>${r.name}</option>`)}
              </select></label
            >`
          : nothing
      }${this.ha?.user && !this.ha.user.is_admin ? html`<p role="alert">${t.admin}</p>` : nothing}
      <nav class="tabs" aria-label="Roborock">
        ${(["maps", "settings", "schedules", "history"] as Tab[]).map(
          (tab) =>
            html`<button
              type="button"
              data-tab=${tab}
              aria-pressed=${String(this.tab === tab)}
              @click=${() =>
                this.guard(() => {
                  this.tab = tab;
                })}
            >
              ${t[tab]}
            </button>`,
        )}
      </nav>
      <div
        class="feedback"
        role=${this.error ? "alert" : "status"}
        aria-live="polite"
      >
        ${this.error || (this.pending ? t.pending : this.message)}
      </div>
      ${this.uncertain ? html`<button type="button" @click=${() => void this.load(true)}>${t.refresh}</button>` : nothing}${
        this.data
          ? this.tab === "settings"
            ? this.settingsView()
            : this.tab === "maps"
              ? this.mapsView()
              : this.tab === "history"
                ? this.historyView()
                : html`<section class="surface">
                    <h2>${t.schedules}</h2>
                    <p class="hint">${t.nativeSchedules}</p>
                    <a class="button" href="/config/automation/dashboard"
                      >${t.openAutomations}</a
                    >
                  </section>`
          : nothing
      }
      <dialog
        id="confirm"
        aria-labelledby="confirmation-title"
        @cancel=${() => {
          this.confirmation = undefined;
        }}
      >
        <h3 id="confirmation-title">${t.confirm}</h3>
        <p>${this.confirmation?.text}</p>
        ${this.error ? html`<p role="alert">${this.error}</p>` : nothing}
        <div class="actions">
          <button
            type="button"
            class="primary"
            ?disabled=${this.pending || (this.uncertain && !this.confirmation?.readonly)}
            @click=${() => this.confirmation?.action()}
          >
            ${t.confirm}</button
          ><button
            type="button"
            ?disabled=${this.pending}
            @click=${() => this.closeConfirmation()}
          >
            ${t.cancel}
          </button>
        </div>
      </dialog>
    </main>`;
  }
}
if (!customElements.get("roborock-companion-panel"))
  customElements.define("roborock-companion-panel", RoborockPanel);
