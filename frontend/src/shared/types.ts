export interface Entity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}
export interface Hass {
  language?: string;
  locale?: { language?: string; number_format?: string; time_format?: string };
  config?: { time_zone?: string };
  user?: { is_admin: boolean };
  states: Record<string, Entity>;
  callService(
    domain: string,
    service: string,
    data?: Record<string, unknown>,
  ): Promise<unknown>;
  callWS<T = unknown>(message: Record<string, unknown>): Promise<T>;
  fetchWithAuth?(url: string, options?: RequestInit): Promise<Response>;
  formatEntityState?(entity: Entity): string;
  connection?: {
    subscribeMessage<T>(
      callback: (data: T) => void,
      message: Record<string, unknown>,
    ): Promise<() => void>;
  };
}
export interface Config {
  type: string;
  entity: string;
  title?: string;
  appearance?: "default" | "bubble";
  show_map?: boolean;
  show_maintenance?: boolean;
  entities?: string[];
}
export interface Point {
  x: number;
  y: number;
}
export interface Room {
  id: number;
  name: string;
  x?: number;
  y?: number;
  bounds?: number[];
}
export interface MapSnapshot {
  id: number;
  name: string;
  active: boolean;
  rooms: Room[];
  calibration: { vacuum: Point; map: Point }[] | null;
  width: number;
  height: number;
  image_url: string;
  robot?: Point;
  charger?: Point;
  walls: number[][];
  no_go: number[][];
  no_mop: number[][];
  path: Point[][];
  preservation_complete: boolean;
  edit_blocker?: string | null;
}
export interface Setting {
  entity_id: string;
  kind: "switch" | "select" | "number" | "time" | "button";
  name: string;
  value: unknown;
  available: boolean;
  options: string[];
  min: number;
  max: number;
  step: number;
  unit?: string;
}
export interface Snapshot {
  api_version: 1;
  entity_id: string;
  revision: string;
  available: boolean;
  updated_at: string;
  state: string;
  generation: number;
  current_map: number | null;
  connection: {
    local_available: boolean;
    server_kind: string;
    command_transport: string;
    maps_transport: string;
  };
  maps: MapSnapshot[];
  settings: Setting[];
  schedules: unknown[];
  capabilities: Record<
    string,
    { status: "available" | "unverified" | "unsupported"; reason?: string }
  >;
}
export interface OperationResult {
  request_id: string;
  status: "confirmed" | "pending" | "unconfirmed" | "failed";
  revision: string;
  completed_steps: string[];
  error?: string;
  data?: unknown;
}
