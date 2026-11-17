---
version: alpha
name: Roborock
description: Home Assistant robot controls and a floorplan configuration workspace.
colors:
  primary: "#03a9f4"
  background: "#ffffff"
  text: "#212121"
  muted: "#727272"
  border: "#e0e0e0"
  danger: "#db4437"
typography:
  sans:
    fontFamily: "Roboto, system-ui, sans-serif"
rounded:
  DEFAULT: "12px"
  button: "22px"
  bubble: "24px"
spacing:
  inset: "20px"
  panel: "24px"
  compact: "16px"
components:
  button:
    minHeight: "44px"
  dialog:
    borderRadius: "16px"
---

# Roborock design

## Overview

Product/admin UI for a household using Home Assistant. The daily card answers
what the robot is doing and gives an obvious cleaning action. The configuration
panel is a floorplan workbench for PC/tablet, with a large map and a 340px tools
column. The owner's approved architecture and setup guide own product behavior.
The map is the signature element; avoid marketing heroes, decorative metrics,
external fonts or a replacement dashboard shell. Follow the established
House State / Audio Zone control language. English/Bokmål are required; this is
not a Japan-market product.

## Colors

Home Assistant's theme is canonical (token model B). The frontmatter records
fallbacks, not fixed light-mode product colors. The package-contained styles.ts
maps primary-color → --rr-primary, primary-text-color → body text,
secondary-text-color → --rr-muted, divider-color → --rr-border,
card-background-color → --rr-surface and error-color → --rr-error.
Controls, status, dialogs and map overlays consume those roles. Keep errors
textual as well as colored. Bubble uses bubble-card-background when available.

## Typography

Inherit ha-font-family-body, with Roboto/system fallbacks. Panel heading 24px/500,
card heading 20px/500, section title 16px/500 and help 14px with 1.5 line height.
Preserve supplied names verbatim. Format measurements and dates using the active
regional locale independently of dictionary selection.

## Layout

The map/workspace is the main desktop surface, followed by structured controls.
Two columns collapse below 900px; normal document scrolling preserves long forms.
Card padding is 20px, 16px below 400px; panel padding is 24px, 16px on narrow
screens. Avoid fixed-height application shells. The map owns only its clipped
zoom surface; dialogs own bounded modal scrolling. Reserve a feedback line.

## Elevation & Depth

Use HA surfaces and dividers. Native dialogs use a neutral translucent backdrop;
keep controls reachable at short viewport heights. No decorative shadows.

## Shapes

HA card radius with 12px fallback, Bubble 24px, pill controls 22px and 44px
round Configure cog. Native form controls have 8px radius and 44px height.

## Components

The shared package-contained styles.ts owns control tokens; i18n.ts owns strings
and safe locale normalization. Native select owns its popup geometry and keyboard
behavior. The map renderer owns calibration and viewport geometry, while the
server owns supported operations, validation and revisions. The existing bundled
recorder library owns history dialog/chart interactions. Use semantic buttons,
visible keyboard focus, explicit busy/disabled states and non-drag coordinate
fields for geometric actions. Reduced motion uses no decorative animation.

UI helper copies in the two independently distributable repositories are kept
in sync during coordinated changes; no runtime or build needs a sibling checkout.

## Do's and Don'ts

Keep real home data out of demos. Distinguish draft, confirmed, partial and
uncertain results. Do not label all traffic local because a socket is local.
Do not activate unverified tools, draw guessed robot coordinates or make the card
a prerequisite for configuring the integration. Document geometry limitations
rather than disguising disabled tools as completed feature parity.
