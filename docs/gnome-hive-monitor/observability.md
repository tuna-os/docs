---
sidebar_position: 4
title: "observability"
---

## Overview

`gnome-hive-monitor` is a client-side GNOME Shell extension (`extension.js`) written in JavaScript/GJS. It queries the Hive status API (`GET /api/widget`) and optionally communicates with GitHub API endpoint (`POST /repos/{owner}/{repo}/issues`) via `libsoup` 3.0 (`Soup.Session`).

## Managed-Project Observability Posture

Per operations policy:
- **No exporter or external data flow backend is configured.**
- No telemetry exporter (e.g. Prometheus exporter, OTLP collector endpoint) is added.
- Observability relies on structured client-side GLib/GJS console logging (`console.log`, `console.warn`, `console.error`) written to standard system logger (`journalctl -f -u gnome-shell` or `journalctl --user -f -o cat`).

## Operational Guidelines & Diagnostic Logging

1. **Client Diagnostics**: Structured console logs must include the `[GNOME Hive Monitor]` prefix for auditability.
2. **Error Logging**: Network timeouts, HTTP 4xx/5xx responses, JSON parsing failures, and API issue submission errors should be captured in `journalctl`.
3. **Future Exporter Integration**: If an operator-managed telemetry collector or backend is designated in the future, client metrics (poll latency, HTTP status code counters, UI error rates) should be forwarded via a local loopback listener without introducing third-party SaaS dependencies.
