---
title: Adoption metrics
---

The [adoption dashboard](/metrics) shows weekly estimates of TunaOS installations that send reports. It reads the [public JSON feed](pathname:///api/adoption). It does
not count unique people, downloads, or individual retention.

## Participation

Installed images enable reports by default once operators configure collection.
Your opt-out persists across image updates. These commands are only for adoption reports from TunaOS. Countme for distribution repositories has separate controls.
Use these commands:

```bash
sudo tunaos-countme status
sudo tunaos-countme enable
sudo tunaos-countme disable
```

Disable creates `/etc/tunaos/countme/disabled` and masks
`tunaos-countme.timer` and `tunaos-countme.service`. Live media and CI do not
participate. The client sends the image variant, flavor, architecture, and an
age bucket since the first eligible try. It sends no device ID or account.

Age starts at the first eligible try, not the installation date. A failed
request also starts this clock.

Cloudflare must process the IP address of each source to deliver reports. Application
storage contains aggregate counters, but database history can let an operator
reconstruct a report's category tuple. This does not promise absolute
anonymity.

Cloudflare automatically keeps database recovery history for up to
30 days. Counter deletion does not immediately erase this history. See
[Cloudflare database backups](https://developers.cloudflare.com/d1/reference/time-travel/).
Published aggregates remain public after you disable reports.

## Public data

Weeks start on Monday in UTC. The current week stays private. Counts round
down to multiples of ten. Counts from one to nine stay private; a category
with a small group has its whole margin suppressed. The collector publishes no category cross-tabs. Suppressed and unavailable values are not zero.

A published zero means no
reports; the collector suppresses counts from one to nine.

The dashboard warns when the latest closed week is absent or the feed is
more than 24 hours old. A fresh timestamp alone does not prove that the
publication schedule still runs. Degraded weeks can undercount. Offline systems, opt-outs, reinstalls, resets,
and automated reports also affect estimates. The dashboard gives ranges and
shares based on rounded counts, with tables for each available category.

## Website deployment

The website Worker serves `/api/adoption` before static assets. It fetches
`https://countme.tunaos.org/v1/metrics`. For staging, set the Worker variable
`ADOPTION_METRICS_URL` to a trusted HTTPS collector endpoint. Do not put
credentials, query strings, or visitor-controlled values in that variable.

The proxy validates the public schema and closed weeks before it returns
JSON. The proxy copies no visitor cookies or headers. Cloudflare may add
transport headers; the collector does not read or store them. See
[Cloudflare’s header reference](https://developers.cloudflare.com/fundamentals/reference/http-headers/#cf-connecting-ip-in-worker-subrequests).
The proxy sends no visitor query strings upstream.
Valid feeds cache for five minutes in browsers and fifteen minutes at the
edge. Invalid or unreachable feeds return HTTP 503 with no cache; the
interface shows that metrics are unavailable. It does not insert sample data.

The collector must be deployed separately with its database migrations and
publication schedule before the dashboard can show data. See the
[source and deployment guide](https://github.com/tuna-os/tunaos/tree/main/services/countme).

The public category allowlist in `src/data/adoption-categories.json` is derived
from `services/countme/src/allowlist.json` in tuna-os/tunaos. When supported
images change, regenerate it with `node scripts/sync-adoption-categories.mjs`
and the path to that file. The proxy rejects new categories until you update the website allowlist.
