# Educational Computer Lab Deployment Guide

TunaOS gives lab administrators in schools and universities a container-managed base image. It lowers the maintenance work and gives each student the same environment at every boot.

## Key Benefits for Educational Institutions

1. **Zero-Drift Student Workstations**: A student cannot change the system files in `/usr`. A reboot puts the machine back on the lab image.
2. **Central Updates from OCI**: Control 100 or more lab machines from one place. Push a new container image to a local registry or to a public one.
3. **Curriculum Software as Flatpaks**: Add the tools for the course (LibreOffice, GIMP, VS Code, GeoGebra) as Flatpaks. They bring their own dependencies.

## Deployment Architecture

- **Base OS**: TunaOS Bonito (Fedora base) for newer packages, or Skipjack (CentOS Stream 10 base) for a longer support life.
- **Update Mechanism**: A nightly systemd timer that runs `bootc update` and pulls the new image.
- **User Sessions**: Set up guest sessions that reset, through the GDM or LightDM configuration.
