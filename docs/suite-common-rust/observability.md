---
sidebar_position: 4
title: "observability"
---

## Executive Summary

`suite-common-rust` is a legacy GTK4/libadwaita utility crate that has been **deprecated** in favor of the canonical `suite-common` crate in the `tuna-os/gtk-office-suite` monorepo.

As part of the operational readiness audit for `suite-common-rust`, this document details the current telemetry/observability state, evaluates backend configuration guidelines, and specifies the operational policy regarding metrics and tracing instrumentation for this legacy repository.

---

## Managed Observability Targets

- **Open Source / Kube-Native / Commercial Targets:** None configured.
- **Backend Status:** Unconfirmed.

### Exporter & Data Flow Policy
Per operator safety and architecture guidelines, **no external telemetry backend or exporter is configured or added to `suite-common-rust`**. Because this crate is deprecated and undergoing retirement evaluation, adding instrumentation or telemetry data flows to this standalone crate would introduce unnecessary churn and divergence from `tuna-os/gtk-office-suite`.

---

## Technical Audit Findings

1. **Deprecated Scaffolding Surface:**
   The current crate contains lightweight UI scaffolding functions (`make_app`, `make_header_bar`, `make_toolbar`, `is_dark_mode`). None of these routines perform server side operations, network requests, or long-running background tasks.
   
2. **Lack of Telemetry Wiring:**
   There are no dependencies on `tracing`, `opentelemetry`, or `prometheus` in `Cargo.toml`.
   
3. **Monorepo Migration:**
   Active telemetry and observability instrumentation guidelines must be established in the canonical `tuna-os/gtk-office-suite` monorepo (`gtk-office-suite/suite-common/`) rather than in this repository.

---

## Recommendations for Operators & Maintainers

1. **Instrumentation Scope:**
   Maintain `suite-common-rust` in a zero-exporter state. Do not add telemetry probes, metrics scrapers, or tracing logic to this repository.
2. **Canonical Telemetry Target:**
   Direct all future observability enhancements, SLO/SLI tracking, and logging standards to `tuna-os/gtk-office-suite`.
3. **Retirement Roadmap Alignment:**
   Complete the retirement decision gate outlined in `ROADMAP.md` by 2026-09-15. Upon archiving this repository, ensure all monitoring documentation references the monorepo.
