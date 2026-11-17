# Changelog

## 0.1.0 — Unreleased

- Bind to the existing official Roborock integration without copying credentials or creating a second robot connection.
- Add an admin configuration panel for desktop/tablet, structured entity-backed settings, room display names, map geometry and cleaning history.
- Add model/geometry-gated map tools, operation deduplication, stale-save protection and explicit uncertain/partial results.
- Support English/Bokmål and the standard upstream local server deployment.
- Saros hardware actions remain unverified; unrecognized restrictions and model commands fail closed.
- Keep all physical map writes disabled until an exact model, firmware and operation profile is verified; none ship initially.
- Reject duplicate restriction blocks and mismatched image versions, revalidate awaited edits, preserve unrelated drafts and use map-qualified room actions.
