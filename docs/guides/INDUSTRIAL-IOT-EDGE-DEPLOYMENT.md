# Industrial IoT & Edge Gateway Deployment Guide

TunaOS provides embedded systems engineers and edge computing architects with a resilient, transactional, and container-managed operating system baseline for remote edge nodes and IIoT gateways.

## Key Advantages for Edge & Industrial Deployments

1. **Transactional OTA Updates**: Over-the-air OS updates are pulled as standard container layer diffs via OCI registries. If an update fails health checks, automatic GRUB rollback restores the operational image.
2. **Read-Only Root Partition**: System files `/usr` remain read-only, protecting edge gateways deployed in field locations from power failures or filesystem corruption.
3. **Edge Workload Isolation**: Run telemetry collection (MQTT, Prometheus exporters), protocol translation (Modbus, OPC-UA), and local analytics as unprivileged Podman containers.

## Edge Deployment Architecture

- **Base OS**: Minimal TunaOS Skipjack (CentOS Stream 10 base) or Albacore (AlmaLinux base).
- **Container Microservices**: Manage local edge workloads using quadlets / systemd container units:
  ```ini
  [Container]
  Image=ghcr.io/my-org/telemetry-collector:latest
  Exec=python3 /app/collector.py
  PublishPort=1883:1883

  [Install]
  WantedBy=multi-user.target
  ```
- **Remote Update Automation**: Scheduled systemd timer for background container updates (`bootc update`).

---
*Filed by outreach agent (ACMM L6 — full mode)*
