# Roborock interaction contract

See DESIGN.md for visual roles and docs/api-v1.md for the server boundary.

## Canonical UI map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Select/Listbox | Native select or HA form selector | DESIGN.md | platform popup / HA selector | browser controls and editor schema |
| Form | Panel draft/field renderer | API v1 and server validation | robot settings / map edit | Save, Cancel, conflict browser tests |
| Date | Intl locale formatter | HA locale and server timestamp | display only | locale unit tests |
| Scrollbar | Shared styles.ts | DESIGN.md | clipped map, bounded native dialog | static and browser checks |
| Toast | Reserved localized feedback line | API operation result | pending / error / confirmed | rejection and successful-save tests |
| CRUD | Panel operation and draft guard | API v1 | settings save / map confirmation | browser tests and backend permission/payload tests |

There is no selectable data grid, so table selection is not applicable.

## State and mutation

HA is authoritative. Keep drafts separate, persist on explicit Save and discard
on Cancel. Before switching robot/floor/tab, guard dirty drafts with an app-owned
dialog. Actual page unload uses beforeunload; the host HA sidebar owns navigation.
Keep the settings link accessible during failures. Ignore stale replies after
device changes/unmount. Prevent duplicate requests; never replay uncertain writes
or run schedules/room sequences in a browser. Settings Save does not clean.

Native dialogs provide modal focus and Escape handling. Keep destructive dialogs
open through the request, show partial/uncertain results and prevent another send
until current state is refreshed. No native alert/confirm/prompt is used.

## Data, locale and recovery

Map data is private and not persisted in browser storage or URL parameters.
Only robot selection uses an HA entity ID in panel URLs. Cleaning-session history
is bounded with previous/next navigation; do not create an unbounded table.
Sensor history is owned by the versioned bundled library, with related readings,
gaps and multiple unit scales. Static settings/timestamps are documented history
exceptions. Names/IDs/service enum values are preserved; card labels, errors,
confirmations, tooltips and accessible names are localized. Language choice and
regional formatting are independent. Failed drafts remain editable.

## Accessibility and resilience

Target WCAG 2.2 AA, native semantics, 44px primary controls, visible focus and
textual errors. Form fields have real labels. Numeric coordinate fields provide
a keyboard/non-drag alternative. Map edits require verified transform and current
floor; unknown restriction data disables replacement. Offline/unknown data blocks
robot mutations. Retain read access to setup and historical information.
