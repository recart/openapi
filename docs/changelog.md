---
stoplight-id:
---

# Changelog

All notable changes to Recart's developer surfaces are documented here.

📡 **Subscribe:** [RSS / Atom feed](https://github.com/recart/openapi/releases.atom)

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Changes are split into two tracks — the **REST API** and **client-side scripting** — because they are versioned differently (see below).

## Versioning

### REST API — date-based, pinned

The [REST API](https://recart-app.stoplight.io/docs/openapi) uses **date-based versioning** — the version in the base path, e.g. `2023-12` in `https://api.recart.com/app-integrations/2023-12`. Clients pin a version, so:

- **Additive, backward-compatible changes** (new endpoints, new optional parameters, new response fields, new webhook events) ship into the **current** version — changelog entry only, no version bump.
- **Breaking changes** (removing/renaming fields or endpoints, making a parameter required, changing a type or response shape, changing auth/error formats) create a **new dated version** that runs side-by-side, so existing integrations keep working.

### Client-side scripting — evergreen, unpinned

The `window._recart` [on-site methods](https://recart-app.stoplight.io/docs/openapi/iro1tnice6vbe) and [Opt-in Tool events](https://recart-app.stoplight.io/docs/openapi/xz7vhcvtwprrz) are delivered by an **evergreen script** loaded on the storefront. There is no version to pin — every merchant runs the latest build, so a change is live for everyone at once. Because of that:

- Changes are tracked **by date**, not by version number.
- Keep changes **strictly backward-compatible**. Never remove or rename a method, event, or field without first marking it `Deprecated` here and giving a removal window (recommend ≥ 60 days).
- `Removed` entries should only appear after that deprecation window has elapsed.

Each entry is also published as a scope-tagged [GitHub Release](https://github.com/recart/openapi/releases) (`[API]` or `[Web SDK]`), which powers the RSS feed above.

---

## REST API

### [2023-12.3] - 2026-08-04

#### Added
- `GET /optin-tools` and `GET /optin-tools/{id}` endpoints for listing the site's opt-in tools (popups, landing pages, embedded forms, keywords) and retrieving a single opt-in tool with its full settings.

### [2023-12.2] - 2026-07-07

#### Deprecated
- The `shopperId` field is deprecated. The `window._recart.getShopperId()` method that populated it has been removed with no replacement; the field remains for backward compatibility but should not be relied upon.

### [2023-12.1] - 2026-06-24

#### Added
- `PATCH /subscribers` endpoint for updating subscribers with custom attributes ([#44](https://github.com/recart/openapi/pull/44)).

---

## Client-side scripting

### 2026-07-07

#### Removed
- `window._recart.getShopperId()` is no longer available. There is no direct replacement — remove any calls to it from your storefront code.
