# Industrial IoT & Edge Gateway Deployment Guide

TunaOS gives embedded engineers and edge architects a transactional, container-managed operating system for remote nodes and IIoT gateways.

## Key Advantages for Edge & Industrial Deployments

1. **Transactional OTA Updates**: The system takes over-the-air updates as standard container layers from an OCI registry. The previous image stays on the disk. To go back, run `bootc rollback` or select the earlier entry in GRUB. For an automatic return on a failed health check, add greenboot. The base image does not do this on its own.
2. **Read-Only Root Partition**: The system files in `/usr` stay read-only. This protects them from a power failure at the gateway. The writable areas still need a filesystem that recovers well.
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
