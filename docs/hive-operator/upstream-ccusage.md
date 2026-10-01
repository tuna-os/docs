---
sidebar_position: 6
title: "upstream ccusage"
---

**Status: drafts. Nothing here has been filed.** The repo is now
`ccusage/ccusage` (old `ryoppippi/ccusage` redirects).

## How they take contributions

From `CONTRIBUTING.md` and `AGENTS.md` at HEAD, 2026-09-24:

- **Open an issue before any PR**, and wait for a maintainer to reply `lgtm`.
  - A contribution gate triages issues and PRs from new contributors automatically.
  - `lgtmi` from a maintainer lets your later issues skip the gate. Only `lgtm` lets you open PRs.
- **You must understand your change.** AI help is allowed. Generated output you can't explain gets closed.
- **Issues should be short and concrete**, written in your own voice, US English.
  - Use the issue templates.
  - Say why it matters and whether you want to implement it.
- **Where code goes**:
  - Runtime logic is Rust.
  - Per-source code lives in `rust/adapters/<agent>`.
  - Shared code lives in `ccusage-core` / `ccusage-adapter-common`.
  - `apps/ccusage` is only the npm launcher.
- **Before a PR**:
  - Run `just fmt && just typecheck && just test` inside their Nix dev shell.
  - Update docs through their `docs` skill whenever a flag, JSON field or source changes.
  - PRs are squash-merged; small stacked commits are preferred.
- **A report-set change is encoded twice** and needs both places updated:
  - `STANDARD_AGENT_REPORTS` in `rust/crates/ccusage-cli/src/types.rs`
  - `agent_report_supported` in `rust/crates/ccusage-cli-parser/src/parser.rs`

Recent activity shows they merge adapter fixes quickly, e.g. #1774 (antigravity: skip zero-byte DBs) and #1676 (copilot: read session-state usage events). A focused, well-evidenced issue should get a hearing.

**Out of scope for upstream:** limits, remaining quota and rotation. ccusage measures consumption. Deciding what a limit is stays in the operator (`internal/usage/pool.go`).

Suggested filing order: 1 and 2 are small and unblock us the most. 3 is the one that retires our ledger.

---

## 1. Follow symlinks when walking source directories

**Title:** Source walkers skip symlinked files and directories

In `ccusage-adapter-common` (`collect_usage_files`, `common/src/lib.rs:24-30`), the walker uses `DirEntry::file_type()`, which does not follow symlinks. As a result, a session file or project directory that is a symlink is never read. Only the root passed in through an env var is resolved.

Why it matters:
- Multi-user and containerised setups rely on symlinks. Our hive runs each agent with `HOME=/data/home/agents/<name>`, where `.claude`, `.codex` and `.gemini` are symlinks to a shared store.
- A filtered view (for example, symlinking only recently modified files to speed up a scan) reads as empty.

Reproduction on v20.0.24:
```
mkdir -p v/claude/projects/x && ln -s ~/.claude/projects/<p>/<s>.jsonl v/claude/projects/x/
CLAUDE_CONFIG_DIR=$PWD/v/claude ccusage claude session --json   # → 0 sessions
```
The same thing happens with `ANTIGRAVITY_DATA_DIR` pointing at a directory of symlinked `.db` files: 0 sessions in 0.16 s, against 34 sessions from the same files copied.

Proposal:
- Use `fs::metadata` (which follows links) for entries that are symlinks.
- Guard against cycles with a visited set of (dev, ino).

I'm happy to implement this.

## 2. Antigravity: attribute sessions to a project, and speed up the scan

**Title:** antigravity sessions report `projectPath: "Antigravity"`; parsing takes ~0.5 s per conversation DB

**Attribution.** Every Antigravity session row has the constant project `"Antigravity"`. The workspace path is present in the database, though: a byte scan of the DB/WAL finds the cwd (e.g. `/data/agents/<name>`) in 76 of 80 recent conversations. With `projectPath` set to the workspace, `--instances`/per-project reports would work for Antigravity the way they already do for Claude and pi.

Watch out when extracting it: the path sits inside protobuf blobs, so a naive regex picks up neighbouring length/tag bytes (`guid`, `guidej` next to 131× `guide`). It needs to come from the decoded trajectory metadata field, not a string search.

**Performance.** On a real store of 500 conversation DBs (206 MB), `ccusage antigravity session --json --offline` takes about **185 s of single-core CPU** (~0.5 s per DB; 40 DBs / 16 MB took 20 s). Claude (120 MB) takes 1 s and codex (10 homes) takes 6 s. The loader (`loader.rs:19-40`) parses databases sequentially. Two possible fixes:
- Use the same size-balanced parallel reads the JSONL adapters already use.
- Cache parsed events per (path, size, mtime), since most conversation DBs never change again.

Either would make a 5-minute refresh cadence viable. I can share timings and profile data.

## 3. Time-precise report bounds (or an events export)

**Title:** `--since/--until` accept only dates, so provider quota windows can't be reported

Provider limits are windows whose start the provider decides: Anthropic's 5-hour session (for example 12:40→17:40Z), the weekly cap, and Codex's primary/secondary windows. `--since` accepts `YYYYMMDD` only. `blocks` is Claude-only and anchors on the hour of the first message, so it doesn't line up with the provider's reset (`blocks --active` reported 15:00–20:00 while Anthropic's own window was 12:40–17:40).

Either of these would help:
- **(a)** Accept RFC 3339 timestamps in `--since/--until` for every report. `session` totals would then be bounded to the instant (related: #1609, #1791).
- **(b)** Add `ccusage <source> events --json`: one row per priced request with `timestamp`, `sessionId`, `projectPath`, `model` and the token/cost fields. This is the most general option, and callers can window it however they like.

Today we work around it by differencing cumulative `session` totals between collections (`internal/usage/ledger.go`). That is exact to the collection interval, but only after a warm-up, and it needs persistent state. (b) would let us delete that code.

## 4. Codex: report the source home (or cwd) per session

**Title:** `codex session` rows can't be attributed when `CODEX_HOME` lists several homes

With `CODEX_HOME=a,b,c`, session rows carry `directory: "2026/09/20"` and a `sessionId` that is a date path, but nothing that says which home the row came from. Rollouts do record `cwd` in `session_meta`, though. Please add one of:
- `projectPath` from `session_meta.cwd`, consistent with claude and pi, or
- a `codexHome` field.

Until then we run ccusage once per `CODEX_HOME` (10 runs, ~0.6 s each).

## 5. Copilot CLI: read `session-store.db`

**Title:** current Copilot CLI writes usage to `~/.copilot/session-store.db`, which isn't read

On our hosts, current Copilot CLI builds no longer write `session-state/*/events.jsonl`. Usage instead goes to the SQLite table `assistant_usage_events`, with these columns:
- `model`
- `input_tokens`, `output_tokens`, `cache_read_tokens`, `cache_write_tokens`, `reasoning_tokens`
- `request_multiplier`, `total_nano_aiu`
- `created_at`

`ccusage copilot` reports nothing for these hosts. `request_multiplier` also makes premium-request accounting possible, which is the unit Copilot's quota is actually in.

I'd propose a reader alongside the existing events.jsonl and OTEL paths.

## 6. Minor: pricing and model ids

**Priced at HEAD but unpriced in the release.** `claude-opus-5-5` is unpriced in the 20.0.24 embedded snapshot but already present at HEAD in `models-dev-pricing.json`. This doesn't need an issue, just a release; noting it because it zeroed a real window for us. We run a `pricingOverrides` stopgap (`config/usage/ccusage-config.yaml`).

**Antigravity placeholder ids.** Antigravity records `model_placeholder_m322` for some requests. A mapping from Antigravity placeholder ids to real model names, if one is discoverable from the DB, would stop these showing up as unpriced.

## Not proposed

- **Limits or remaining quota in ccusage.** That needs provider APIs and credentials, which is contrary to its local-files design. It stays in the operator.
- **A Muse (Meta) CLI adapter.** Its session format (`.msp-view-v1` journals) is undocumented. We have one agent on it and Meta publishes no usage API anyway (`meta: unknown no-usage-api`). Revisit if usage grows.
