---
sidebar_position: 6
title: "OBSERVABILITY"
---

This document defines the observability contract for the index maintenance
scripts and their workflows. It is an operator guide, not a promise of a
telemetry service.

## Current state

This repository has no telemetry SDK, collector, metrics endpoint, trace
exporter, or external observability backend. Python scripts report through
standard output, standard error, and process exit status. GitHub Actions may
retain that output as a workflow log under the repository's normal retention
settings; the scripts do not send a second copy elsewhere.

`scripts/enrich-index.py` and `scripts/oci.py` read OCI manifests and labels
from the registry named by the input index. The scheduled metadata workflow
also downloads the public served index. Those requests are required index
operations, not telemetry. They must remain limited to endpoints selected by
the caller, input index, or workflow.

**Policy:** diagnostics must not create off-box telemetry traffic. You must
complete the review below before you add an exporter, collector, analytics
call, or error report service. `index/static` and OCI labels are product data, not an
observability store.

## Diagnostic contract

Command output is human-readable. It is not a stable machine API. Automation
must use exit status and the index file. Automation must not parse prose.

| Source | Normal signal | Warning or failure signal |
|---|---|---|
| `scripts/update-index.py` | Writes an `Updated ...` summary to stdout after the index file is committed. | Missing optional AppStream metadata writes `WARNING:` to stderr. Missing required labels, invalid JSON, or invalid OCI layout fails non-zero. `--require-appstream` promotes missing AppStream metadata to a failure. |
| `scripts/enrich-index.py` | Writes registry-read progress and a final count/status to stdout. In `--check` mode, exit `0` means no repair or hard metadata problem was found. | `~` lines on stderr are presentation warnings, such as missing screenshots. `!` lines are metadata or registry problems. In `--check` mode, needed repairs or hard problems return `1`; execution errors also return non-zero. |
| `scripts/oci.py` | Emits no routine output; it returns data to its caller. | Exhausted registry requests raise `RegistryError`; the CLI caller decides how to display the failure and exits non-zero. |

New diagnostics must follow these conventions:

- Send progress and successful summaries to stdout. Send warnings and errors to
  stderr. Return a non-zero status when an operation is incomplete, validation
  fails, or a check finds a required change.
- State the operation, affected repository or relative file, and corrective
  action. Include architecture, bounded counts, and OCI digest when they help
  identify an index entry.
- Keep one problem per line where practical so CI logs remain searchable.
- Do not dump whole manifests, label maps, AppStream XML, or HTTP bodies.
- Python's standard `logging` module may replace `print()` when levels or output
  destinations are useful, but default output must remain dependency-free and
  human-readable. Do not install network logging handlers.

## Privacy and data handling

Safe diagnostic fields are public repository names, architectures, OCI
digests, bounded aggregate counts, operation names, and repository-relative
paths. Even when source data is public, log only fields needed to diagnose the
operation.

Never emit registry tokens, authorization or cookie headers, credentials, URLs
or query strings that contain secrets, or full environment dumps.
Never send complete HTTP responses, private label values, or unredacted AppStream payloads.
Prefer a registry host over a full URL and a relative path over an absolute
workspace path. Redact sensitive values before you construct a message. A CI
log masker is not enough.

Diagnostics stay in the caller's terminal or the CI system that runs the
command. Scripts must not transmit diagnostics, identifiers, or usage data to
any additional endpoint. A telemetry failure must never block index generation
because, under the current policy, no telemetry call should exist.

## Operator-facing signals

| Signal | Meaning | Operator action |
|---|---|---|
| `Tests` workflow failure | Script tests, lint, or screenshot-action checks failed. | Inspect the failing job and reproduce only the named check. |
| Scheduled `Check remote metadata` failure | Served index differs from registry labels, required metadata is missing, or registry access failed. | Read `~` and `!` lines, distinguish presentation warnings from hard problems, then repair the publishing source or reviewed index. |
| `Deploy Pages` failure | Repository Pages deployment failed. | Inspect checkout, artifact upload, and deployment steps; this does not imply an index-validation failure. |
| `update-index.py` non-zero exit | Candidate index was not safely updated. | Correct the reported layout, JSON, or label problem before publishing. |

The scheduled check is the repository's production-facing health signal. There
is no separate dashboard or alert transport; GitHub workflow status and logs
are the source of diagnostic evidence.

## Review path for metrics or tracing

Future metrics, traces, or error reports must arrive as an explicit pull
request. CODEOWNERS for the repository must review it. Before you add any
dependency or network destination, the proposal must document:

1. operator question and why existing exit codes and workflow logs cannot
   answer it;
2. exact fields and data classification, destination and protocol, retention,
   access controls, and deletion path;
3. credential source and least-privilege permissions;
4. bounded metric labels or span attributes, sample rate, expected volume, and
   cost;
5. timeout and failure behavior that cannot delay or fail index publication;
6. an operator-controlled enablement and rollback plan.

Repository names, digests, refs, paths, and free-form error text must not become
unbounded metric labels. Spans must not contain manifests, labels, AppStream
XML, tokens, or HTTP bodies. Until maintainers approve such a proposal, the
configuration must not let telemetry export go off-box.
