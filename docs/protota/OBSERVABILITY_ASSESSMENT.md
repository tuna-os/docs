---
sidebar_position: 5
title: "OBSERVABILITY ASSESSMENT"
---

## Status Summary

As of Q3 2026, **Protota** is an unbacked client-side React/Vite application hosting a GNOME Adwaita mockup editor and renderer. Per operator policy, **no backend telemetry exporter or external data flow is configured**. 

Under Telemetry Agent Policy (Hold-Gated Mode), telemetry agents do not introduce external data exporters or off-box data flows when no collector backend is configured. This document provides the current observability assessment and baseline guidelines for client-side diagnostics and eventual OpenTelemetry SDK integration.

---

## Observability Assessment

### Current Architecture & Signal Surface
- **Frontend Stack**: React 19, Vite 8, Zustand, Playwright, Vitest.
- **Client-Side Diagnostics Engine**: In-browser diagnostics rules and blueprint syntax checker (`src/diagnostics/engine.ts`, `src/diagnostics/liveBlueprintClient.ts`).
- **Agent Surface**: Global window contract (`window.protota`) exposed for testing, automation, and UI inspection (`src/runtime/agentHandle.ts`).
- **Telemetry Infrastructure**: None currently enabled or exporting data.

### Recommended Stack Architecture (Future Operator Wiring)
When an operator configures a telemetry collection backend (e.g., OpenTelemetry Collector, Prometheus gateway, or OTLP web receiver), the recommended stack for Protota includes:

1. **Structured Client Diagnostics Logging**:
   - Standardized console log formatting for component mounting, blueprint parsing, and preset loading.
   - Diagnostic event emission via window event bus or internal logger abstraction.

2. **Client-Side OpenTelemetry Web SDK**:
   - Optional `@opentelemetry/sdk-trace-web` integration gated by explicit environment variables or host configuration.
   - Bounded spans around blueprint parsing, export operations, and broadway renderer execution.

3. **Client-Side Metrics & Performance Signals**:
   - Performance Observer integration for Web Vitals (LCP, CLS, FID) and custom render timings.
   - Bounded attribute cardinalities to prevent memory leaks in client sessions.

---

## Stack Guidelines & Operational Guardrails

1. **Zero External Exporters Without Backend Configuration**:
   - Do not add OTLP exporters, Google Analytics, Sentry, or third-party web beacons unless an operator backend is explicitly confirmed.
2. **Privacy & Data Containment**:
   - Keep user-designed mockup contents, exported Blueprints, and document trees strictly within client memory / local browser storage (`fake-indexeddb` / IndexedDB).
3. **Bounded Metrics & Attributes**:
   - Ensure all metric attributes and span tags have finite, low-cardinality sets (e.g., standard action names, widget types, error categories).
4. **CI Conformance**:
   - Maintain clean execution under `npx tsc -b`, `npm run lint`, and unit/integration testing.
