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

### [2023-12.5] - 2026-08-17

#### Added
- `GET /optin-tool-experiments` and `GET /optin-tool-experiments/{id}` endpoints for listing the site's opt-in tool A/B test experiments (scheduled, running and ended) and retrieving a single experiment with its window, participating variants and winner.
- `GET /optin-tool-experiments/{id}/views/{name}` endpoint exposing A/B test results — one view per section (`optin-statistics`, `revenue-statistics`, `revenue-by-optin-segments`, `metric-event-statistics`), plus `all` returning every section in one response. Each section returns every variant of the experiment, keyed by the variant's opt-in tool ID. There are no date parameters: the range is derived from the experiment itself — an ended experiment uses its full window, a running one spans its start until now, and a scheduled one has no statistics yet and returns 400.

### [2023-12.4] - 2026-08-10

#### Added
- `GET /optin-tools/{id}/views/{name}` endpoint exposing popup performance statistics — one view per section (`optin-summary`, `optin-history`, `revenue-summary`, `revenue-history`, `revenue-by-optin-segments`, `revenue-by-countries`, `subscriptions-history`), plus `all` returning every section in one response. History views return time-series buckets at a selectable `targetResolution` (day/week/month/year, UTC, Monday-start weeks) with gaps zero-filled; summaries and breakdowns are range totals. `dateFrom`/`dateTo` are optional and default to the last 7 days.

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
