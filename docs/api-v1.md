# Roborock Companion API v1

All requests use the authenticated HA websocket. `list`, `snapshot` and `subscribe` enforce robot read permission. `execute` additionally requires an administrator. Image GET `/api/roborock_companion/map/{entity_id}/{map_id}?v=<snapshot image hash>` requires authentication and the same robot permission.

- `roborock_companion/list` returns `{api_version:1, robots:[{entity_id,name,available}]}`.
- `roborock_companion/snapshot` with `entity_id` returns the current snapshot.
- `roborock_companion/subscribe` with `entity_id` emits snapshots and supports normal HA unsubscribe.
- `roborock_companion/execute` takes `entity_id`, a named `operation`, typed `params`, `expected_revision` and a unique `request_id` (1–80 letters/digits/underscore/hyphen).

Snapshot fields are `api_version`, `entity_id`, `revision`, `updated_at`, `available`, `state`, `generation`, `connection`, `current_map`, `maps`, `settings`, `schedules` and `capabilities`. `updated_at` is snapshot generation time, not proof of map freshness. Missing geometry is explicit. Capabilities have `available|unsupported|unverified` status and a stable reason.

Operations return `{request_id,status,revision,completed_steps,error,data}`. Status is `confirmed|pending|unconfirmed|failed`. A successful websocket response can still contain a failed or unconfirmed robot operation. Do not show success for a retry acknowledgement or replay uncertain mutations.

Implemented operations: `settings_save` (`changes:[{entity_id,value}]`), `room_display_save` (`map_id,room_id,name`), `map_refresh` (`{}`), `history_read` (`offset,limit`, limit 1–10), `schedules_read` (`{}`), and feature-gated `room_split` (`map_id,room_id,line:[x1,y1,x2,y2]`), `room_merge` (`map_id,rooms:[id,id]`), `floor_material` (`map_id,room_id,material,direction`), `map_restrictions_save` (`map_id,walls:[[x,y,x,y]],no_go:[[x,y,x,y,x,y,x,y]]`), `map_backup`, `map_restore` and `map_build` (`map_id,confirm:true`). Coordinates are integer robot millimetres, never image pixels. Physical map operations require the active floor and idle/docked state.

Wall/no-go replacement is limited to a single saved map whose bounded header audit and official parsed geometry agree. No-mop or unknown restriction blocks disable it. Carpets, thresholds and other unverified commands are not enabled merely because their RPC name is known.

`connection.local_available` reports a direct local socket. `command_transport:ha_managed` makes no per-command routing claim. `server_kind` distinguishes `roborock_cloud`, `custom_server` and `unknown`; custom does not itself prove LAN reachability. The integration's configured server handles MQTT/map requests.

The companion uses the official integration's private runtime behind one compatibility adapter. It never accepts arbitrary RPC method names or client-supplied device IDs. Entry reload/removal invalidates old results. Standard public HA actions remain independent of this API.

Image versions are enforced: a missing or mismatched version returns HTTP 409,
never a newer image with an older calibration. Snapshots use floor-keyed cache
content; shared live bytes are used only after a guarded single-floor observation.

`map_goto` (`map_id,x,y`) and `map_zone_clean`
(`map_id,x1,y1,x2,y2,repeats`, repeats 1–3) call public HA actions, require one
saved map, valid calibration and the current revision. They return unconfirmed
after dispatch because the physical motion is not observed to completion.
Settings may include `kind:button`; these are immediate public `button.press`
actions, never values accepted by `settings_save`. Room cleaning uses public
`vacuum.clean_segments` with `segment_ids:["<map_id>_<room_id>"]`.

Physical map-writing operations additionally require an exact model/firmware
protocol profile. **No profiles ship in this release**, so these writes are disabled.
Future verified profiles must still pass fresh status/map checks before and after
opening an edit session, lossless-preservation checks, and cleanup acknowledgement.
The captured bulk replacement path is restricted to a single map at index 0.
Split/merge room counts are insufficient confirmation and remain unconfirmed.
