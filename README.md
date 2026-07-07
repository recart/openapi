# openapi
Recart's OpenAPI specification

## Updating the changelog

Every notable API change is tracked in [`docs/changelog.md`](docs/changelog.md) and exposed as an RSS/Atom feed via GitHub Releases.

The changelog has two tracks, versioned differently (see the Versioning section in the changelog):

- **REST API** — date-based, pinned versions (`2023-12`). Additive changes stay on the current version; breaking changes get a new dated version.
- **Client-side scripting** (`window._recart` methods, Opt-in Tool events) — evergreen script, no pinned version. Track by date, stay backward-compatible, and `Deprecate` before you `Remove`.

When you change either surface:

1. **Add an entry to `docs/changelog.md`** in the same PR, under the matching track, following the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) format.
2. **After merge, cut a GitHub Release** whose notes mirror the entry. Prefix the title with the scope and use a matching tag:
   - REST API → tag `api-2023-12.1`, `api-2023-12.2`, … (tied to the API version)
   - Client-side scripting → tag `websdk-YYYY-MM-DD` (date-based)

The Release feed is served automatically at `https://github.com/recart/openapi/releases.atom` — no extra tooling required.
