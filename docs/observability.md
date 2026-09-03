# Operational Observability Assessment and Telemetry Guidelines

This document outlines the observability posture and build diagnostic rules for the `tuna-os/docs` website.

## Observability Posture and Architecture

The `tuna-os/docs` site uses Docusaurus. It builds static assets deployed to edge nodes.

### Log Streams and Diagnostic Data

- **Build Logs**: Output from static compilation, TypeScript type checks, and link validation in GitHub Actions.
- **Client Console Logs**: Browser console errors and warnings from React components or search scripts.
- **Edge Deployment**: Status codes and traffic metrics from edge providers.

## Managed Observability Backend Status

Operator configuration status:
- Open source backend: None configured.
- Kube-native backend: None configured.
- Commercial backend: None configured.

This repository contains no external telemetry exporters, metrics collectors, or third-party scripts.

## Incident and Operational Diagnostics

Follow these steps for site errors or build failures:
- Check logs in `.github/workflows/` for build step failures.
- Read `runbooks/site-diagnostics.md` for triage procedures and escalation paths.
