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

### [2023-12.16] - 2026-09-25

#### Added
- `OptinToolExperiment` carries the A/B test wizard setup: `variants` (per opt-in tool `optinToolId`, traffic `weight` as a fraction of 1 and `isControl`), `primaryMetric` (`emailOptin`, `smsOptin`, `associatedRevenue`, `orders`, `averageOrderValue`, `revenuePerVisitor` or `orderConversionRate`), `tags` (`value` + `label`) and `notes`. Older experiments have none of these: they split traffic evenly, have no designated control and were decided on opt-in rate.
- `winnerMetricValue` — the winning variant's value of `primaryMetric`, present with `winnerOptinToolId`. For an experiment without a `primaryMetric` it is the winner's opt-in rate, so consumers need not branch on the experiment's age.
- `status` gains `draft` and `cancelled`; `GET /optin-tool-experiments` lists experiments in every status. The views of a `draft`, `scheduled` or `cancelled` experiment return 400.

### [2023-12.15] - 2026-09-22

#### Added
- `GET /discounts` and `GET /discounts/{id}` endpoints for the site's discounts. Discounts come in three shapes, told apart by `customizationType` and `expiryType`: general (one shared `code`), code pool (`unique` + `fixed` — `discountCodePattern`, `mode` (`refilling` serves flows and popups, `non-refilling` serves campaigns), `targetCount`, `availableCount`, `fillStatus`) and expiring (`unique` + `relative` — `discountCodePattern`, `durationSeconds`, `template`; one Shopify price rule per issued code, no `startsAt`/`endsAt`). The list supports `mode`, `available` and `flowId` filters plus `limit`/`offset` (default page size 100) and carries configuration and pool state only, no statistics.
- `GET /discounts/{id}` additionally returns `usage` (the flows, campaigns and opt-in tools configured with the discount, as ids and names) and `statistics` — lifetime counters with no date range: `sent` (codes issued by Recart) always, and, with the new `omitShopifyData` query parameter set to `false` (default `true` skips the live Shopify call), `used`, `sales` (by currency) and `codesCount` from Shopify. Expiring discounts carry `sent` only.

### [2023-12.14] - 2026-09-21

#### Added
- `complete_control_kept` value of `adaptiveTestStatus` on `GET /campaign-flows/{id}` and `GET /campaign-flows/{id}/views/adaptive-flow-summary` — the adaptive test ended and the control message was kept because no variant beat it.

### [2023-12.13] - 2026-09-17

#### Added
- `GET /subscribers/{id}` — one subscriber by internal id: timezone, current segments (`id`, `name`, `type`) and, per selected channel, `status`, `subscribedAt`, `lastInteractionAt`, `subscriptionSource`, `country` and the full `optinHistory` of opt-in and opt-out events. Every source carries its `type` and, for opt-in tools and imports, the `id` and `name` of the entity behind it. Phone number, email and names are never returned.
- `GET /subscribers?phoneNumber=` — the subscribers behind an E.164 phone number, returning the same resources as a list (normally one entry, empty when none). The number is a lookup key only.
- Both take an optional `channel` query parameter (`sms` only today, the default); the resource carries one key per selected channel.

### [2023-12.12] - 2026-09-17

#### Added
- `GET /subscribers/views/{name}` gains three views. `list-summary` — the list statistics for the range: list size at the end of the range, new subscriptions (gross), subscriber-initiated unsubscriptions by how the opt-out arrived (`keyword`, `ai`, `optOutLink`, `dashboard`, `publicApi`, `integration`) and automated cleaning by reason (`deactivatedNumber`, `knownLitigator`, `landline`, `reassigned`). `list-history` — the same statistics per UTC calendar day. `countries-summary` — the currently subscribed numbers by country, a snapshot without a date range. The data of these views is grouped by channel; the new optional `channel` query parameter selects the channels (`sms` only today, the default).

### [2023-12.11] - 2026-09-11

#### Added
- `GET /accounts` — the accounts the API key gives access to. An API key belongs to one account, so the list carries a single entry with the account's `id`, `name`, `domain`, `currency` (ISO 4217) and `timezone` (IANA name, `null` when unset). Lets an integration identify the account behind its key without a second lookup.

### [2023-12.10] - 2026-09-09

#### Added
- `GET /campaign-flows/{id}/views/adaptive-flow-summary` — for an adaptive campaign, its id and name, the adaptive test state and result (`adaptiveTestStatus`, `adaptiveTestResult`, `testVariantsDispatchedAt`) and one entry per variant with `evaluationStats` (`sent`, `clickRate`, `sales`, `spent`, `roi`, `optOutRate` frozen at the moment the test was evaluated — the numbers the winner was picked on) next to `allTimeStats` (the variant's lifetime totals at request time). Ignores `dateFrom` and `dateTo`; 404 for a standard campaign.

### [2023-12.9] - 2026-09-07

#### Added
- `GET /flows/views/{name}` — account-level flow statistics views: `sms-summary` (the SMS channel's totals, narrowable with `tags`), `flow-groups-summary` (one entry per flow group, campaigns included as `blast`), `automated-flows-summary` (one entry per automated flow) and `campaign-flows-summary` (one entry per campaign with activity in the range); both carry the flow's `flowId` and `name`. Range totals; the date range defaults to the last 7 days.
- `GET /automated-flows/{id}/views/{name}` and `GET /campaign-flows/{id}/views/{name}` — `flow-summary` (the flow's totals) and `flow-items-summary` (an object keyed by `flowItemId`, one key per message item) for one automated flow or one campaign. The campaign views default to the campaign's lifetime when the range is omitted.
- Every view returns the same `FlowStatistics` object: sent, clicked, clickRate, converted, sales and spent per currency, roi, optOutRate, spamRate and revenuePerMessage; recipients and revenuePerRecipient are present on every view except `sms-summary`, whose channel total has no first-message cohort.

### [2023-12.8] - 2026-09-02

#### Added
- `GET /automated-flows` and `GET /automated-flows/{id}` endpoints for listing the site's automated flows and retrieving one with its full structure. Automated flows carry a flow status (`draft`, `active`, `inactive`, `cancelled`).
- `GET /campaign-flows` and `GET /campaign-flows/{id}` endpoints for listing the site's campaigns and retrieving one with its full structure. Campaigns carry the dashboard's send status (`scheduled`, `sending`, `sent`, …) instead of a flow status.
- Both `/automated-flows/{id}` and `/campaign-flows/{id}` return the flow's full item graph (messages, delays, splits, adaptive tests) with outbound edges resolved to item ids via `entryFlowItemId`/`nextItemId`.
- The published `GET /flows` and `GET /flows/{id}` are unchanged.

### [2023-12.7] - 2026-08-26

#### Added
- `optinToolName` and `optinToolType` on every `optin-tools-summary` entry of `GET /optin-tools/views/{name}`. Each entry already carried the tool's `optinToolId`; it now identifies the tool outright, so a response can be grouped or filtered by opt-in tool type (`popup`, `landing-page`, `embedded-form`, `keyword`) and its tools named without a second `GET /optin-tools` call.

### [2023-12.6] - 2026-08-25

#### Added
- `GET /optin-tools/views/{name}` endpoint exposing account-level opt-in tool statistics — the collection-level counterpart of `GET /optin-tools/{id}/views/{name}`, returning every opt-in tool of the site in one response. One view: `optin-tools-summary` — one entry per opt-in tool with its raw metric-event unique-session counts (sparse; counts only, no USD amounts) merged with the new SMS subscriptions it collected in the range. `dateFrom`/`dateTo` are optional and default to the last 7 days.
- `GET /subscribers/views/{name}` endpoint exposing subscriber statistics views. One view: `subscription-sources` — the new SMS subscriptions collected in the range, one entry per source (opt-in tool types and non-tool sources like import, custom-integration, public-api, shopify_checkout), sorted descending by `smsSubscriptions`. `dateFrom`/`dateTo` are optional and default to the last 7 days.

### [2023-12.5] - 2026-08-17

#### Added
- `GET /optin-tool-experiments` and `GET /optin-tool-experiments/{id}` endpoints for listing the site's opt-in tool A/B test experiments (scheduled, running and ended) and retrieving a single experiment with its window, participating variants and winner.
- `GET /optin-tool-experiments/{id}/views/{name}` endpoint exposing A/B test results — one view per section (`optin-summary`, `revenue-summary`, `revenue-by-optin-segments`, `metric-event-summary`), plus `all` returning every section in one response. Each section returns every variant of the experiment, keyed by the variant's opt-in tool ID. There are no date parameters: the range is derived from the experiment itself — an ended experiment uses its full window, a running one spans its start until now, and a scheduled one has no statistics yet and returns 400.

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
