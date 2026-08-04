---
stoplight-id:
---

# Rate Limits and Error Handling

The Recart REST API applies rate limits to a subset of its endpoints to keep the platform responsive and to guarantee fair usage across all integrations. This guide explains how the limits work, how to read the rate limit headers, what a `429` response looks like, and how to build a client that handles limits gracefully.

---

## How rate limiting works

Recart uses a **fixed-window rate limiting algorithm** with a single **steady window of one minute**. Every rate-limited endpoint belongs to a tier that defines how many requests are allowed per window.

Key properties:

- **Limits are applied per site.** The bucket is keyed by the site associated with your API key, per endpoint. All traffic targeting the same site and endpoint counts against the same bucket, regardless of which key produced it.
- **Only authenticated requests consume quota.** Rate limiting runs after authentication — rejected requests (`401`, `403`) never count against your limit.
- **Buckets are per endpoint.** Each rate-limited endpoint (method + route) has its own counter; exhausting the limit on one endpoint does not affect the others.
- When the limit is exceeded, the API responds with **HTTP `429 Too Many Requests`** until the current window resets.

> Limit values may be adjusted over time. Always treat the [rate limit headers](#rate-limit-headers) returned by the API as the source of truth rather than hard-coding the values below.

## Rate limit tiers

| Tier | Steady limit |
| ---- | ------------ |
| S    | 60 / minute  |
| M    | 150 / minute |

## Which endpoints are rate limited

Every rate-limited endpoint states its tier in its own [API reference](https://recart-app.stoplight.io/docs/openapi) description — look for the **Rate limit tier** line. If an endpoint's description does not mention a rate limit tier, the endpoint is not rate limited.

## Rate limit headers

**Every** response from a rate-limited endpoint — successful or not — carries the current state of the steady window:

| Header                  | Description                                                | Example |
| ----------------------- | ---------------------------------------------------------- | ------- |
| `x-ratelimit-limit`     | Maximum number of requests allowed in the current window   | `60`    |
| `x-ratelimit-remaining` | Number of requests remaining in the current window         | `42`    |
| `x-ratelimit-reset`     | Seconds until the current window resets                    | `30`    |

A `429` response **additionally** carries:

| Header        | Description                                    | Example |
| ------------- | ---------------------------------------------- | ------- |
| `retry-after` | Seconds to wait before retrying the request    | `30`    |

Example of a successful response:

```http
HTTP/1.1 200 OK
content-type: application/vnd.api+json
x-ratelimit-limit: 60
x-ratelimit-remaining: 42
x-ratelimit-reset: 30
```

## The 429 response

When the limit is exceeded, the API returns `429` with the standard Recart error body. The `detail` field includes the retry window:

```http
HTTP/1.1 429 Too Many Requests
content-type: application/vnd.api+json
retry-after: 30
x-ratelimit-limit: 60
x-ratelimit-remaining: 0
x-ratelimit-reset: 30
```

```json
{
  "errors": [
    {
      "id": "17035478-01a9-4aeb-a13c-88ab51e6fee3",
      "code": "ERR_TOO_MANY_REQUESTS",
      "title": "Too many requests",
      "detail": "Rate limit exceeded, retry in 30 seconds"
    }
  ]
}
```

This is the same error envelope used by every other Recart API error (`errors` array with `id`, `code`, `title`, `detail`), so existing error handling keeps working — only the `code` and status differ.

## Handling rate limits in your client

### Respect `retry-after`

Never retry before the `retry-after` window has elapsed — retrying earlier only consumes your next window faster. The header value is authoritative; prefer it over any locally computed delay.

### Watch `x-ratelimit-remaining`

If you run batch jobs (for example, syncing all opt-in tools of a site), read `x-ratelimit-remaining` on each response and slow down proactively as it approaches zero instead of waiting for the first `429`.

## Response status codes

| Status | Meaning               | Notes                                                                 |
| ------ | --------------------- | --------------------------------------------------------------------- |
| `200`  | OK                    | Successful read                                                       |
| `201`  | Created               | Resource created                                                      |
| `202`  | Accepted              | Request accepted for asynchronous processing                          |
| `204`  | No content            | Successful request with no response body                              |
| `400`  | Bad request           | Malformed input — for example an invalid resource ID format           |
| `401`  | Unauthorized          | Missing or invalid API key; does **not** consume rate limit quota     |
| `403`  | Forbidden             | The key is not allowed to perform the request; does not consume quota |
| `404`  | Not found             | The resource does not exist on the site associated with your API key  |
| `429`  | Too many requests     | Rate limit exceeded — see [The 429 response](#the-429-response)       |
| `5xx`  | Server error          | Transient — safe to retry with backoff                                |

All error responses share the `errors` array envelope shown above.
