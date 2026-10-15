---
sidebar_position: 1
sidebar_label: "ccleft"

status: unknown
---

> **Status:** proposed as the prober implementation for [Hive](https://github.com/hivecommons/hive) in [hivecommons/hive#8753](https://github.com/hivecommons/hive/issues/8753).

**How much AI coding-agent quota is _left_?** The opposite of
[ccusage](https://github.com/ryoppippi/ccusage).

ccusage reads local logs and tells you what you **spent**. ccleft asks each
provider's own quota source what is **remaining**, and when it comes back. It
works headlessly across many agent homes, so a fleet scheduler (or a Grafana
panel) can see headroom before it starts work:

```
$ ccleft probe --home /data/home --home /home/agent2
PROVIDER  ACCOUNT           STATE    PLAN        WINDOW                 LEFT                   RESETS                            HOMES
claude    f9794d5bc42b675d  ok       max         five_hour              77%                    2026-09-24 22:00Z (in 3h0m0s)     /data/home,/home/agent2
                                                 seven_day              39%                    2026-09-27 16:00Z (in 69h0m0s)
                                                 seven_day_opus*        0%                     2026-09-27 16:00Z (in 69h0m0s)
                                                 extra_usage*           37.66/50 usd           -
codex     1c0ffee0c0ffee00  limited  prolite     five_hour              77%                    2026-09-24 23:00Z (in 4h0m0s)
                                                 weekly                 0%                     2026-09-26 07:35Z (in 36h35m0s)
kiro      615f2a301afa4565  ok       KIRO POWER  plan                   9571.28/10000 credits  2026-10-01 00:00Z (in 148h26m0s)  env
* = informational window (does not decide the account state)
```

It is a Go **library first** (`github.com/tuna-os/ccleft`) with a small CLI and
a Prometheus exporter on top. Seeded from the probers in
[Hive](https://github.com/hivecommons/hive) so Hive can adopt it directly.

## Providers

| provider | source ccleft reads | credential (all paths under the source home) | windows | states it can report |
|---|---|---|---|---|
| `claude` | `GET api.anthropic.com/api/oauth/usage` + `anthropic-beta: oauth-2025-04-20` | `~/.claude/.credentials.json` OAuth access token (`$CLAUDE_CONFIG_DIR` honoured); account from `~/.claude.json` `oauthAccount` | `five_hour`, `seven_day` (binding); `seven_day_<model>` scoped (Opus/Sonnet/...) non-binding; `extra_usage` (USD, from cents) | ok, limited, rate_limited (429 is common — Retry-After honoured), auth_required (`token_expired` is transient, `login_expired`, `no_credentials`, `http_401`), error |
| `codex` | `GET chatgpt.com/backend-api/wham/usage` + `ChatGPT-Account-Id` | `$CODEX_HOME/auth.json` (default `~/.codex/auth.json`) ChatGPT tokens. **Never runs `codex`** (it can refresh/rewrite `auth.json`) | primary/secondary windows banded by duration (`five_hour`, `daily`, `weekly`, `monthly`); `code_review:*` scoped; `credits` (balance as string **or** number) | ok, limited (incl. `limit_reached`), auth_required (`token_expired` from JWT `exp`, `http_401`), unsupported (`api_key_login`), rate_limited, error |
| `agy` | runs `agy --print /usage --output-format json` with `HOME=<source home>`, an explicit minimal env and a 90 s deadline | `~/.gemini/antigravity-cli/antigravity-oauth-token` must exist (else the CLI is not run) | per-pool buckets (`gemini-weekly`, `3p-5h`, ...) with `scope` = pool; every pool binds | ok, limited, auth_required (`login_required`), error (`timeout`, `not_installed`, `schema`) |
| `gemini` | none — reported locally | `~/.gemini/oauth_creds.json` or `GEMINI_API_KEY` | – | **unsupported** (`api_shutdown`: since Google's June 2026 shutdown `loadCodeAssist` → `UNSUPPORTED_CLIENT`, `retrieveUserQuota` → `PERMISSION_DENIED`; `api_key_login`) |
| `kiro` | `POST q.us-east-1.amazonaws.com/` `X-Amz-Target: AmazonCodeWhispererService.GetUsageLimits`, `tokentype: API_KEY` | `KIRO_API_KEY` (`ksk_...`) | `plan` monthly credits (used = currentUsage − currentOverages, reset = `nextDateReset`; `daysUntilReset` ignored), `bonus:<code>`, `free_trial`, `overage` (only when enabled) | ok, limited (plan + bonus + enabled overage all gone), auth_required (AWS `AccessDeniedException` etc.), rate_limited (`ThrottlingException`), error |
| `copilot` | `GET api.github.com/copilot_internal/user` | `Source.Credentials`, `COPILOT_GITHUB_TOKEN`/`GH_TOKEN`/`GITHUB_TOKEN`, `~/.config/github-copilot/apps.json`, `~/.config/gh/hosts.yml` (plain-text only) | monthly `premium_interactions`, `chat`, `completions` (unlimited ones become notes); free tier from `limited_user_quotas`/`monthly_quotas` | ok, **limited when remaining ≤ 0**, unsupported (`no_copilot` on 404), auth_required, error |
| `deepseek` | `GET api.deepseek.com/user/balance` | `DEEPSEEK_API_KEY` | `balance:<currency>` (does not reset) | ok, **exhausted** (≤ 0 or `is_available: false`), auth_required, error |
| `muse` | none — reported locally | `META_API_KEY` | – | **unsupported** (`api_key_login`: API-key logins cannot read quota; device-code login is phase 2) |

Implementation / test / live status:

| provider | implemented | httptest fixtures | live-verified |
|---|---|---|---|
| claude | yes | yes (both payload shapes, 429, expiry, drift) | **yes** (2026-09-25, Hive production: `five_hour`/`seven_day`/`seven_day_fable` matched the Hive's own probe; 429s carry no `Retry-After`, last-good served `stale`) |
| codex | yes | yes (string & numeric balance, expiry, API-key login, live weekly-only capture) | **yes** (2026-09-25, Hive production) |
| agy | yes | yes (real agy 1.2.1 + 1.2.10 captures, login prompt, timeout, env isolation, account dedupe) | **yes** (2026-09-25, agy 1.2.10, read-only `HOME`) |
| gemini | yes (static verdict) | yes | shutdown verified by evaluation |
| kiro | yes | yes (real capture, bonus/overage, AWS error) | **yes** (2026-09-24) |
| copilot | yes | yes (paid, free, token files, 404, live over-quota capture) | **yes** (2026-09-25, individual plan) |
| deepseek | yes | yes (ok, exhausted, live negative balance) | **yes** (2026-09-25) |
| muse | yes (static verdict) | yes | – |

## Reading

```jsonc
{
  "provider": "claude",
  "account": "f9794d5bc42b675d",   // sha256("ccleft\0provider\0identity")[:16] — non-secret, stable
  "homes": ["/data/home", "/home/agent2"],  // every home that resolved to this account
  "state": "ok",                    // ok|limited|exhausted|rate_limited|auth_required|unsupported|error
  "cause": "",                      // machine code on non-ok / stale: http_429, token_expired, schema, api_shutdown...
  "message": "",                    // human detail incl. the upstream error text — never swallowed
  "plan": "max",
  "windows": [{
    "id": "seven_day", "kind": "weekly", "scope": "", "binding": true,
    "used": 61, "limit": 100, "remaining": 39, "used_pct": 61, "remaining_pct": 39,
    "resets_at": "2026-09-27T16:00:00Z", "unit": "percent"
  }],
  "fetched_at": "2026-09-24T19:00:00Z",   // time of the measurement (last-good time when stale)
  "stale": false,                          // true = last-good served during a 429/network/5xx
  "retry_at": null                         // next upstream attempt allowed (Retry-After / backoff)
}
```

State rules: **limited** = a binding window that resets on its own is used up;
**exhausted** = a non-resetting pool (prepaid balance) is used up;
**rate_limited** = the *quota endpoint* throttled us (says nothing about quota).
Model-scoped windows and paid overflow (credits, extra usage, overage) never
decide the state on their own — an Opus cap is not an account cap. An
unrecognized payload is an `error`/`schema`, never a healthy reading.

## Library

```go
import "github.com/tuna-os/ccleft"

// one-shot
r := ccleft.Probe(ctx, ccleft.Source{Provider: ccleft.Claude, Home: "/data/home"})

// fleet: cache, single-flight, backoff, per-account rate limit, dedupe
c := ccleft.NewClient(nil)
srcs := ccleft.DetectHome("/data/home", nil)
srcs = append(srcs, ccleft.DetectEnv(map[string]string{"KIRO_API_KEY": key})...)
readings := c.GetAll(ctx, srcs)
for _, r := range readings {
    if w, ok := r.Binding(); ok { fmt.Println(r.Provider, r.State, *w.RemainingPct) }
}
_ = ccleft.WritePrometheus(os.Stdout, readings)
```

`Source{Provider, Home, Env, Credentials}`: every path comes from `Home` or
`Env` (`CODEX_HOME`, `CLAUDE_CONFIG_DIR`, `XDG_CONFIG_HOME`, `GH_CONFIG_DIR`);
the library never reads the process `$HOME` or environment. `Credentials`
overrides discovery with a token/key. `Prober` fields override endpoints,
timeouts, the clock, the agy binary and the exec function (for tests).

`Client` behaviour:

- **Per-account keying + dedupe** — the account fingerprint is resolved from
  local files *before* any network call, so N homes sharing one account make
  one upstream call; `GetAll` merges them into one reading with all `homes`.
- **Single-flight** — concurrent `Get`s for one account share one request.
- **Per-account rate limit** — at most one upstream call per `MinInterval`
  (claude 3 m, agy 2 m, others 1 m by default); callers in between get the cache.
  The gate opens 5% (≤ 30 s) early, so a caller that polls at exactly
  `MinInterval` is not skipped every other round by scheduling jitter;
  backoff and `Retry-After` are honoured exactly.
- **Backoff** — 429/network/timeout/5xx: `BaseBackoff` (30 s) doubling to
  `MaxBackoff` (30 m), optional jitter; a longer `Retry-After` always wins.
- **Last-good** — during those failures (and while a refreshable token is
  expired) the last good reading is served with `stale: true`, the failure's
  `cause`/`message`, and `retry_at`. Definitive answers (401, unsupported,
  schema) are returned as-is.

## CLI

```
ccleft probe [--json] [--home DIR ...] [--provider p,...] [--config FILE] [--no-env]
ccleft serve [--addr :9464] [--refresh 5m] [--home DIR ...] [--config FILE]
```

- No `--home`: probes `$HOME` (CLI convenience only).
- No `--provider`: auto-detects per home from files present (claude, codex,
  agy, gemini, copilot-editor-token) plus API-key providers in the process env
  (`KIRO_API_KEY`, `DEEPSEEK_API_KEY`, `META_API_KEY`, `COPILOT_GITHUB_TOKEN`).
  `GH_TOKEN`/gh `hosts.yml` alone does not trigger Copilot — ask for it with
  `--provider copilot`.
- `--endpoint provider=URL` points a provider at a mock or regional endpoint.
- `serve` exposes `GET /readings` (JSON, `?provider=` filter), `GET /metrics`
  and `GET /healthz`, re-detecting sources every refresh.

Config file: see [`ccleft.example.yaml`](https://github.com/tuna-os/ccleft/blob/main/ccleft.example.yaml). Secrets are
referenced by env var name (`credentials_env`) or file (`credentials_file`),
never inlined; unknown keys are rejected.

### Metrics

| series | labels |
|---|---|
| `ccleft_remaining_ratio` (0..1) | provider, account, window, kind, scope, binding |
| `ccleft_used`, `ccleft_limit`, `ccleft_remaining` | + unit |
| `ccleft_reset_timestamp_seconds` | provider, account, window |
| `ccleft_state` (one-hot) | provider, account, state |
| `ccleft_stale`, `ccleft_fetched_timestamp_seconds` | provider, account |
| `ccleft_info` | provider, account, plan, cause |
| `ccleft_last_refresh_timestamp_seconds` | – |
| `ccleft_upstream_requests_total` (counter) | provider, state, cause — one per upstream HTTP request / agy run; cache, min-interval and backoff answers are not counted |

Example alert: `min by (provider, account) (ccleft_remaining_ratio{binding="true"}) < 0.1`.

Upstream load: `sum by (provider) (increase(ccleft_upstream_requests_total[1h]))`;
throttling: `ccleft_upstream_requests_total{state="rate_limited"}`. `serve` also
logs one `upstream` line per call.

## Fleet / sidecar use

Run one `ccleft serve` per node or per pod, mounting the agent homes
read-only:

```yaml
- name: ccleft
  image: ghcr.io/tuna-os/ccleft:latest
  args: [serve, --config, /etc/ccleft/ccleft.yaml]
  ports: [{containerPort: 9464, name: metrics}]
  volumeMounts:
    - {name: data, mountPath: /data/home, readOnly: true}
    - {name: ccleft-config, mountPath: /etc/ccleft}
  env:
    - name: KIRO_API_KEY
      valueFrom: {secretKeyRef: {name: kiro, key: api-key}}
```

Because accounts are deduped and rate-limited inside one process, prefer
**one** ccleft per account pool over one per agent: the Claude endpoint 429s
when many hosts poll the same account.

**agy**: the default image is distroless-static and has no `agy` CLI, so agy
sources report `cause: not_installed`. Either build a derived image that adds
the agy binary (and its runtime) and set `agy_path`, or run ccleft *inside*
the agent container/sidecar that already ships agy, pointing `--home` at the
agent home. Each agy probe boots the CLI (seconds, up to the 90 s deadline),
which is why agy's default min interval is 2 minutes.

agy 1.2.10 answers `/usage` with a **read-only** `HOME` (it logs that it
cannot write its log/cache files and carries on), so mount agent homes
read-only: ccleft then provably cannot write them, and neither can the agy it
runs. Homes that share one Google login (a symlinked `~/.gemini`) collapse to
one account via the token's `id_token` subject, so N agent homes cost one agy
run per interval.

On Kubernetes ≥ 1.33 with containerd ≥ 2.1 the ccleft image can be mounted as
an **image volume** into a container that already ships agy (no derived image,
no copy step):

```yaml
containers:
  - name: ccleft
    image: <agent image that has agy>
    command: [/opt/ccleft/usr/local/bin/ccleft, serve, --config, /etc/ccleft/ccleft.yaml]
    volumeMounts: [{name: ccleft-bin, mountPath: /opt/ccleft}]
volumes:
  - name: ccleft-bin
    image: {reference: ghcr.io/tuna-os/ccleft:main, pullPolicy: IfNotPresent}
```

## Consumers

- **Hive (headroom)** — `pkg/rotation` probers can be replaced by
  `ccleft.Client.Get`. Mapping: `Headroom.Available` ⇐ `state == ok`;
  `ProbeErr` ⇐ `!state.HasQuota()` (`cause` fills `ProbeErrCause`);
  `Limits[]` ⇐ windows with `binding` (use `scope` for agy's model pools and
  Claude's model caps); `pct_remaining` ⇐ `remaining_pct`. Hive's
  "unknown ⇒ hold" rule is preserved: ccleft never turns a failed or
  unrecognized measurement into headroom, and `stale` lets Hive decide how
  old a last-good reading may be before it holds. This also fixes known Hive
  prober bugs: agy's missing `HOME` and 10 s timeout, the stale codex structs
  (`credits.balance` string vs `*int`), errors collapsed to `probe_failed`,
  and no 429 handling.
- **tuna-os/hive-operator (UsagePool)** — the operator can scrape `/readings`
  (or embed the library) and write `status.accounts[]` per UsagePool from
  `(provider, account)` readings: `remaining_pct` of the binding window,
  `resets_at`, `state`, `stale`. Homes sharing an account arrive pre-merged in
  `homes`, which maps directly onto pool membership.

## Security

- **Read-only.** ccleft never refreshes tokens, never writes, creates or
  chmods credential files, and never runs a CLI that could (no `codex`,
  no `claude`). The only CLI it runs is `agy --print /usage`, with an
  explicit env. A test snapshots the home tree before/after probing.
- Expired tokens are reported (`token_expired`, transient) instead of being
  refreshed, so ccleft cannot race a running agent's own refresh.
- Tokens are sent only to their own provider's endpoint. Outputs contain a
  truncated, domain-separated SHA-256 fingerprint, never a token; upstream
  error snippets are masked for bearer/`ksk_`/`sk-`/`gh*_` strings.
- Config files reference secrets by env var or path, never inline.

## Phase 2

- Muse device-code (OAuth) login quota; Gemini if Google reopens a quota API.
- Copilot: resolve keyring-stored gh tokens; org-seat quotas.
- Claude: optional status-line/HUD source to avoid the 429-prone endpoint.
- Persist the last-good cache across restarts (small state file / configmap).
- `ccleft probe --fail-on limited` exit codes for scripts; `ccleft watch` TUI.
- Kiro regions other than us-east-1 via config (works today with `--endpoint`).

## License

Apache-2.0. Origin and references: see [NOTICE](https://github.com/tuna-os/ccleft/blob/main/NOTICE).
