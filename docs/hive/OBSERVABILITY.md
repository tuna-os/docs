---
sidebar_position: 7
title: "OBSERVABILITY"
---

## Overview

This document outlines the telemetry stack assessment and operational observability guidelines for `hive`, the central orchestration and control plane repository for the `tuna-os` infrastructure.

## Current Telemetry Stack Assessment

1. **Backend Status**: No external telemetry backend (OpenTelemetry Collector, Prometheus gateway, or commercial APM) is currently configured or authorized for automated exports. In accordance with operational policy, no off-box telemetry exporters or external network flows are added without explicit operator configuration.
2. **Architecture**: `hive` contains daemon binaries, CLI tools (`hivectl`), synchronization scripts, and runner orchestration components. Diagnostic capabilities currently depend on stdout/stderr logging, process exit codes, and localized state files.
3. **Observability Scope**: Operational metrics (task execution latency, agent scheduling queues, worker process health) and diagnostic logging represent the primary telemetry requirements.

## Observability Guidelines & Target Architecture

- **Structured Logging**: Daemon services and CLI commands should adopt structured JSON logging (using standard logging abstractions like Go's `log/slog` or `zerolog`) to support automated log ingestion when a collector is configured.
- **Bounded Metrics Endpoint**: Once a metrics collector backend is authorized, operational metrics should be exposed via a bounded `/metrics` Prometheus scraper endpoint or OpenTelemetry metrics exporter.
- **Metric Cardinality Bounds**: All metric dimensions must remain bounded. Do not include high-cardinality attributes (such as agent session IDs, dynamic task UUIDs, or raw payload content) in metric labels.
- **Span Context Propagation**: Request-path execution across daemon components and sub-agents should support OpenTelemetry trace context propagation (`traceparent` standard) to allow end-to-end tracing when enabled.
- **Data Protection & Compliance**: Telemetry data, trace span attributes, and log messages must never contain access tokens, secret keys, or raw system credentials.
