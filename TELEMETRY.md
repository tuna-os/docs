# Telemetry and adoption proxy operations

## Scope and privacy

The `/metrics` page reads aggregate adoption data from `/api/adoption`.
The Worker fetches the feed through the `COUNTME` service binding, or the
configured HTTPS upstream when that binding is absent. Application code sends
no visitor headers, cookies, or query strings to the collector.
Cloudflare can add transport headers. This repository does not control the
collector's storage policy.

The public schema allows weekly totals and approved dimensions only. Counts
below 10 are suppressed; other counts are rounded to tens. The proxy validates
the feed before it returns data. It rejects responses larger than 512,000 bytes.
See `src/data/adoption.mjs` and `scripts/adoption.test.mjs` for the contract.

This change adds no browser analytics, tracking cookies, identifiers, or client
error reporting. Page views and dimension selections are not recorded by this
application. Cloudflare's platform request logs have separate settings and may
contain metadata that these application events omit.

## Worker events

Each invocation of `/api/adoption` emits one JSON `adoption_proxy` event to
stdout. Other site paths do not emit this event. Fields are:

| Field | Meaning |
| --- | --- |
| `method` | GET, HEAD, or OTHER; arbitrary method strings are omitted |
| `status` | Proxy HTTP status: 200, 405, or 503 |
| `duration_ms` | Total proxy processing time, rounded to milliseconds |
| `cache_policy` | public-300-900, no-store, or none |
| `upstream_status` | HTTP status, when an upstream response arrived |
| `upstream_duration_ms` | Time to upstream response headers, including failed fetches |
| `upstream_bytes` | Bytes read from the upstream body, when a chunk arrived |
| `reason` | Fixed failure category, present on 503 responses |

Failure categories cover invalid configuration, fetch failure, timeout, HTTP
error, wrong content type, oversized feed, invalid JSON, schema mismatch, and
unexpected errors. Existing stderr failure messages remain available. Neither
log includes upstream body text, exception text, URLs, request headers, visitor
IPs, cookies, or query strings.

## Inspection and limits

Use the existing Cloudflare Worker log viewer or a local Worker tail to inspect
these events. Stored Workers Logs require an operator to enable observability
in the deployment settings. This repository does not enable storage, change
retention, add a backend, or incur a new service subscription.

Group events by `status` and `reason` to diagnose failures. Compare
`duration_ms`, `upstream_duration_ms`, and `upstream_bytes` to find slow or large
feeds. Counts describe Worker invocations observed in the selected log sample;
they are not unique users or complete site traffic totals. Check the platform's
sampling and retention settings before comparing time periods.

Successful responses declare browser caching for 300 seconds and shared caching
for 900 seconds. Failures use `no-store` and `Retry-After: 300`. The cache policy
field describes response headers, not a measured cache hit. The Worker has no
Cache API lookup, and requests served without invoking it produce no event.
Use Cloudflare's existing cache analytics for hit ratios. Do not infer endpoint
availability or an SLA from sampled logs alone.

Browser analytics, a metrics scraper, alert thresholds, retention policy, and
site-wide request logging require a maintainer decision about the backend,
privacy policy, and operating cost. The static `/metrics` page remains the
adoption dashboard; it is not a Prometheus endpoint.
