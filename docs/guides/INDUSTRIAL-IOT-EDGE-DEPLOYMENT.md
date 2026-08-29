# Industrial IoT & Edge Gateway Deployment Guide

TunaOS gives embedded engineers and edge architects a transactional, container-managed operating system for remote nodes and IIoT gateways.

## Key Advantages for Edge & Industrial Deployments

1. **Transactional OTA Updates**: The system gets over-the-air updates as standard container layers from an OCI registry. If an update does not pass its health checks, GRUB starts the last known good image again.
2. **Read-Only Root Partition**: The system files in `/usr` stay read-only. This keeps a gateway in the field safe from a power failure or a corrupt filesystem.
3. **Edge Workload Isolation**: Run telemetry collection (MQTT, Prometheus exporters), protocol translation (Modbus, OPC-UA), and local analytics as unprivileged Podman containers.

## Edge Deployment Architecture

- **Base OS**: Minimal TunaOS Skipjack (CentOS Stream 10 base) or Albacore (AlmaLinux base).
- **Container Microservices**: Control the workloads on the gateway with quadlets, which are systemd unit files for containers:
  ```ini
  [Container]
  Image=ghcr.io/my-org/telemetry-collector:latest
  Exec=python3 /app/collector.py
  PublishPort=1883:1883

  [Install]
  WantedBy=multi-user.target
  ```
- **Remote Update Automation**: A systemd timer runs `bootc update` in the background on a schedule.
