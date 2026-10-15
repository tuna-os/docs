---
sidebar_position: 5
title: "OBSERVABILITY"
---

This document assesses the telemetry and diagnostic architecture of `suite-common`, a scaffold for Python desktop applications on GNOME. It defines guidelines for local telemetry that comply with TunaOS telemetry policies.

---

## 1. Executive Summary & Stack Assessment

- **Application Type**: Shared Python Library / Scaffold (PyGObject, GTK4, Libadwaita).
- **Configured Telemetry Backend**: **None (Unconfigured)**.
- **Current Data Flows**: Local Python execution and GTK4 event dispatch across applications that import `suite_common`.
- **Policy Enforcement**: No backend collector or server exists, so `suite-common` operates in **audit-only mode**. Add no external exporters, network telemetry, or telemetry dependencies (e.g. OpenTelemetry SDKs, GA4 scripts) to shared scaffold components.

---

## 2. Existing Diagnostic Subsystems

`suite-common` provides shared application bases and window components that interact with GLib/GTK logging and `stderr`:

### 2.1 Python Logging Subsystem
- The wrappers shared by applications initialize the standard library `logging` module.
- Standard error (`sys.stderr`) output stream.

### 2.2 GLib & GTK Diagnostic Environment Variables
- `G_MESSAGES_DEBUG`: Filter the GLib debug log in applications that use `suite_common`.
- `GTK_DEBUG`: Set flags for GTK widget, render, and accessibility diagnostics.

---

## 3. Data Privacy & Local Boundary Guidelines

1. **No External Egress**: Applications that use `suite-common` must never send any telemetry off-device without explicit operator configuration.
2. **PII and Sensitive Data Protection**: Keep document content, file paths, user configuration entries, and environment variables out of diagnostic logging.
3. **Bounded Metrics & Logging**: Any future shared metrics or log helper functions in `suite-common` must maintain strict limits on metric label cardinality.

---

## 4. Operational Runbook & Future Telemetry Roadmap

If an operator explicitly configures an OpenTelemetry or Prometheus collector in applications using `suite-common`:
- Provide provider wrappers for telemetry within `suite_common` that never block. Make them opt-in.
- Enforce strict validation: when unconfigured, no data leaves the box.
