---
sidebar_position: 4
title: "observability"
---

## Executive Summary

`suite-common-rust` is a legacy GTK4/libadwaita utility crate. The project replaced it with the `suite-common` crate in the `tuna-os/gtk-office-suite` monorepo.

This document is part of the operational readiness audit for `suite-common-rust`. It gives the current telemetry state of this legacy repository. It also gives the policy for metrics and trace instrumentation.

---

## Managed Observability Targets

- **Open Source / Kube-Native / Commercial Targets:** None.
- **Backend Status:** Not confirmed.

### Exporter and Data Flow Policy
The operator safety and architecture guidelines apply: **this repository has no external telemetry backend or exporter, and you must not add one**. The project will retire this crate. Telemetry in this standalone crate would only add work and make it different from `tuna-os/gtk-office-suite`.

---

## Technical Audit Findings

1. **Legacy UI helpers:**
   The crate contains small helper functions for the UI (`make_app`, `make_header_bar`, `make_toolbar`, `is_dark_mode`). These functions do not send network requests. They do no server-side work and start no background tasks.

2. **No telemetry wiring:**
   `Cargo.toml` has no dependencies on `tracing`, `opentelemetry`, or `prometheus`.

3. **Monorepo migration:**
   Put telemetry guidelines in the `tuna-os/gtk-office-suite` monorepo (`gtk-office-suite/suite-common/`), not in this repository.

---

## Recommendations for Operators and Maintainers

1. **Instrumentation scope:**
   Keep `suite-common-rust` with zero exporters. Do not add telemetry probes, metrics scrapers, or trace code to this repository.
2. **Telemetry target:**
   Send all new observability work, SLO/SLI records, and log standards to `tuna-os/gtk-office-suite`.
3. **Retirement roadmap:**
   Complete the retirement decision in `ROADMAP.md`. When the project archives this repository, make sure that all observability documents refer to the monorepo.
