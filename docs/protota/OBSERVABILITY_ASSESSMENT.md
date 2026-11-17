---
sidebar_position: 5
title: "OBSERVABILITY ASSESSMENT"
---

## Status Summary

As of Q3 2026, **Protota** is a client-side React/Vite application with no backend. It contains a mockup editor and renderer for GNOME Adwaita. Per operator policy, **Protota has no backend telemetry exporter and no external data flow**.

Under Telemetry Agent Policy (Hold-Gated Mode), telemetry agents do not add exporters for external data or off-box data flows when no collector backend exists. This document gives the current observability assessment. It also gives baseline guidelines for client-side diagnostics and for a future integration of the OpenTelemetry SDK.

---

## Observability Assessment

### Current Architecture & Signal Surface

- **Frontend Stack**: React 19, Vite 8, Zustand, Playwright, Vitest.
- **Client-Side Diagnostics Engine**: In-browser diagnostics rules and blueprint syntax checker (`src/diagnostics/engine.ts`, `src/diagnostics/liveBlueprintClient.ts`).
- **Agent Surface**: Global window contract (`window.protota`) for tests, automation, and UI inspection (`src/runtime/agentHandle.ts`).
- **Telemetry Infrastructure**: None. No telemetry is on now, and no telemetry sends data.

### Recommended Stack Architecture (Future Operator Wiring)

When an operator configures a telemetry collection backend (e.g., OpenTelemetry Collector, Prometheus gateway, or OTLP web receiver), the recommended stack for Protota includes:

1. **Structured Client Diagnostics Logging**:
   - One standard format of console log for these events: a component mounts, a blueprint parses, and a preset loads.
   - Diagnostic event emission via window event bus or internal logger abstraction.

2. **OpenTelemetry Web SDK in the client**:
   - Optional `@opentelemetry/sdk-trace-web` integration gated by explicit environment variables or host configuration.
   - Bounded spans for three operations: the blueprint parser, export operations, and broadway renderer execution.

3. **Client-Side Metrics & Performance Signals**:
   - Performance Observer integration for Web Vitals (LCP, CLS, FID) and custom render timings.
   - Bounded attribute cardinalities to prevent memory leaks in client sessions.

---

## Stack Guidelines & Operational Guardrails

1. **Zero External Exporters Without Backend Configuration**:
   - Do not add OTLP exporters, Google Analytics, Sentry, or third-party web beacons unless an operator explicitly confirms a backend.
2. **Privacy & Data Containment**:
   - Keep user-designed mockup contents, exported Blueprints, and document trees strictly within client memory / local browser storage (`fake-indexeddb` / IndexedDB).
3. **Bounded Metrics & Attributes**:
   - Ensure all metric attributes and span tags have finite, low-cardinality sets (e.g., standard action names, widget types, error categories).
4. **CI Conformance**:
   - Keep `npx tsc -b`, `npm run lint`, and the unit/integration tests clean.
