import { LitElement, html, svg, nothing, css, type PropertyValues } from "lit";
import type { Hass, MapSnapshot, Point } from "./types";
import { strings } from "./i18n";
import { styles } from "./styles";

export function affine(calibration: MapSnapshot["calibration"]) {
  if (!calibration || calibration.length !== 3) return undefined;
  const [p, q, r] = calibration;
  const x = q.vacuum.x - p.vacuum.x,
    y = q.vacuum.y - p.vacuum.y,
    u = r.vacuum.x - p.vacuum.x,
    v = r.vacuum.y - p.vacuum.y;
  const det = x * v - y * u;
  if (!Number.isFinite(det) || Math.abs(det) < 1e-9) return undefined;
  const mx = q.map.x - p.map.x,
    my = q.map.y - p.map.y,
    nx = r.map.x - p.map.x,
    ny = r.map.y - p.map.y;
  const a = (mx * v - nx * y) / det,
    b = (nx * x - mx * u) / det,
    d = (my * v - ny * y) / det,
    e = (ny * x - my * u) / det;
  const c = p.map.x - a * p.vacuum.x - b * p.vacuum.y,
    f = p.map.y - d * p.vacuum.x - e * p.vacuum.y;
  const inverse = a * e - b * d;
  if (
    ![a, b, c, d, e, f, inverse].every(Number.isFinite) ||
    Math.abs(inverse) < 1e-12
  )
    return undefined;
  return {
    toMap: (p: Point) => ({
      x: a * p.x + b * p.y + c,
      y: d * p.x + e * p.y + f,
    }),
    toRobot: (p: Point) => ({
      x: Math.round((e * (p.x - c) - b * (p.y - f)) / inverse),
      y: Math.round((-d * (p.x - c) + a * (p.y - f)) / inverse),
    }),
  };
}
export class RoborockMap extends LitElement {
  static properties = {
    hass: { attribute: false },
    map: { attribute: false },
    selected: { attribute: false },
    points: { attribute: false },
    draftWalls: { attribute: false },
    draftZones: { attribute: false },
    pointMode: { type: Boolean },
    disabled: { type: Boolean },
    zoom: { state: true },
    panX: { state: true },
    panY: { state: true },
    image: { state: true },
    failure: { state: true },
  };
  static styles = [
    styles,
    css`
      :host {
        display: block;
      }
      .viewport {
        overflow: hidden;
        position: relative;
        border-radius: 12px;
        background: var(--secondary-background-color, #f5f5f5);
      }
      .world {
        position: relative;
        transform-origin: center;
      }
      .world img {
        display: block;
        width: 100%;
        height: auto;
        object-fit: contain;
      }
      .world svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        touch-action: pan-y;
      }
      .room {
        position: absolute;
        transform: translate(-50%, -50%);
        font-size: 12px;
        min-height: 32px;
        padding: 5px 9px;
        max-width: 130px;
        white-space: normal;
        background: var(--rr-surface);
      }
      .empty {
        min-height: 280px;
        padding: 40px 20px;
        text-align: center;
      }
      .toolbar {
        justify-content: flex-end;
      }
    `,
  ];
  hass?: Hass;
  map?: MapSnapshot;
  selected: number[] = [];
  points: Point[] = [];
  draftWalls: number[][] = [];
  draftZones: number[][] = [];
  pointMode = false;
  disabled = false;
  private zoom = 1;
  private panX = 0;
  private panY = 0;
  private drag?: { x: number; y: number; panX: number; panY: number };
  private image = "";
  private failure = false;
  private epoch = 0;
  protected updated(changes: PropertyValues) {
    if (
      changes.has("map") &&
      (changes.get("map") as MapSnapshot | undefined)?.image_url !==
        this.map?.image_url
    )
      void this.loadImage();
  }
  disconnectedCallback() {
    super.disconnectedCallback();
    this.epoch++;
    if (this.image.startsWith("blob:")) URL.revokeObjectURL(this.image);
  }
  private async loadImage() {
    const ticket = ++this.epoch;
    const old = this.image;
    this.image = "";
    this.failure = false;
    if (old.startsWith("blob:")) URL.revokeObjectURL(old);
    if (!this.map?.image_url || !this.hass?.fetchWithAuth) return;
    try {
      const response = await this.hass.fetchWithAuth(this.map.image_url);
      if (!response.ok) throw Error("image");
      const blob = await response.blob();
      if (ticket === this.epoch && this.isConnected)
        this.image = URL.createObjectURL(blob);
    } catch {
      if (ticket === this.epoch) this.failure = true;
    }
  }
  private mark(point: Point) {
    return affine(this.map?.calibration || null)?.toMap(point);
  }
  private pointsString(values: number[]) {
    const p = [];
    for (let i = 0; i < values.length; i += 2) {
      const m = this.mark({ x: values[i], y: values[i + 1] });
      if (m) p.push(`${m.x},${m.y}`);
    }
    return p.join(" ");
  }
  private choosePoint(event: PointerEvent) {
    if (
      !this.pointMode ||
      this.disabled ||
      !this.map ||
      !this.image ||
      this.failure
    )
      return;
    const target = event.currentTarget as SVGSVGElement;
    const bounds = target.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    const point = affine(this.map.calibration)?.toRobot({
      x: ((event.clientX - bounds.left) / bounds.width) * this.map.width,
      y: ((event.clientY - bounds.top) / bounds.height) * this.map.height,
    });
    if (
      point &&
      point.x >= 0 &&
      point.y >= 0 &&
      point.x <= 51200 &&
      point.y <= 51200
    )
      this.dispatchEvent(
        new CustomEvent("map-point", {
          detail: point,
          bubbles: true,
          composed: true,
        }),
      );
  }
  render() {
    const t = strings(this.hass),
      m = this.map;
    return html`<div class="toolbar" aria-label=${t.view}>
        <button
          type="button"
          aria-label=${t.zoomOut}
          @click=${() => (this.zoom = Math.max(1, this.zoom - 0.25))}
        >
          −</button
        ><button
          type="button"
          @click=${() => {
            this.zoom = 1;
            this.panX = 0;
            this.panY = 0;
          }}
        >
          ${t.resetView}</button
        ><button
          type="button"
          aria-label=${t.zoomIn}
          @click=${() => (this.zoom = Math.min(3, this.zoom + 0.25))}
        >
          +</button
        ><button
          type="button"
          aria-label=${t.refresh}
          @click=${() => void this.loadImage()}
        >
          ↻
        </button>
      </div>
      ${
        this.zoom > 1
          ? html`<div class="toolbar">
              ${(
                [
                  ["panLeft", -40, 0],
                  ["panRight", 40, 0],
                  ["panUp", 0, -40],
                  ["panDown", 0, 40],
                ] as const
              ).map(
                ([label, x, y]) =>
                  html`<button
                    type="button"
                    aria-label=${t[label]}
                    @click=${() => {
                      this.panX += x;
                      this.panY += y;
                    }}
                  >
                    ${label === "panLeft" ? "←" : label === "panRight" ? "→" : label === "panUp" ? "↑" : "↓"}
                  </button>`,
              )}
            </div>`
          : nothing
      }
      <div
        class="viewport"
        style=${`touch-action:${this.zoom > 1 && !this.pointMode ? "none" : "pan-y"}`}
        @pointerdown=${(e: PointerEvent) => {
          if (this.zoom > 1 && !this.pointMode) {
            this.drag = {
              x: e.clientX,
              y: e.clientY,
              panX: this.panX,
              panY: this.panY,
            };
            (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
          }
        }}
        @pointermove=${(e: PointerEvent) => {
          if (this.drag) {
            this.panX = this.drag.panX + e.clientX - this.drag.x;
            this.panY = this.drag.panY + e.clientY - this.drag.y;
          }
        }}
        @pointerup=${() => {
          this.drag = undefined;
        }}
        @pointercancel=${() => {
          this.drag = undefined;
        }}
      >
        <div
          class="world"
          style=${`transform:translate(${this.panX}px,${this.panY}px) scale(${this.zoom})`}
        >
          ${this.image ? html`<img src=${this.image} alt=${m?.name || t.map} />` : html`<div class="empty muted">${this.failure ? t.failed : t.noMap}</div>`}${
            m && m.width > 0 && m.height > 0
              ? svg`<svg viewBox=${`0 0 ${m.width} ${m.height}`} role="img" aria-label=${m.name} @pointerup=${(e: PointerEvent) => this.choosePoint(e)}><g fill="none" stroke="var(--rr-primary)" stroke-width="2">${(
                  m.path || []
                ).map(
                  (path) =>
                    svg`<polyline points=${path
                      .map((p) => this.mark(p))
                      .filter(Boolean)
                      .map((p) => `${p!.x},${p!.y}`)
                      .join(" ")}></polyline>`,
                )}${[...(m.walls || []), ...this.draftWalls].map((w) => svg`<polyline points=${this.pointsString(w)} stroke="var(--rr-error)"></polyline>`)}${[...(m.no_go || []), ...this.draftZones].map((z) => svg`<polygon points=${this.pointsString(z)} fill="var(--rr-error)" fill-opacity=".12" stroke="var(--rr-error)"></polygon>`)}</g>${this.points.map(
                  (p) => {
                    const q = this.mark(p);
                    return q
                      ? svg`<circle cx=${q.x} cy=${q.y} r="5" fill="var(--rr-primary)"></circle>`
                      : nothing;
                  },
                )}${
                  m.robot
                    ? (() => {
                        const p = this.mark(m.robot!);
                        return p
                          ? svg`<circle cx=${p.x} cy=${p.y} r="7" fill="var(--rr-primary)" stroke="var(--rr-surface)" stroke-width="2"></circle>`
                          : nothing;
                      })()
                    : nothing
                }</svg>`
              : nothing
          }${m?.rooms.map((r) => {
            if (r.x === undefined || r.y === undefined || !m.width || !m.height)
              return nothing;
            const p = this.mark({ x: r.x, y: r.y });
            return p
              ? html`<button
                  type="button"
                  class="room"
                  style=${`left:${(100 * p.x) / m.width}%;top:${(100 * p.y) / m.height}%`}
                  aria-pressed=${String(this.selected.includes(r.id))}
                  ?disabled=${this.disabled || this.pointMode}
                  @click=${() => this.dispatchEvent(new CustomEvent("room-select", { detail: r.id, bubbles: true, composed: true }))}
                >
                  ${r.name}
                </button>`
              : nothing;
          })}
        </div>
      </div>`;
  }
}
if (!customElements.get("roborock-map"))
  customElements.define("roborock-map", RoborockMap);
