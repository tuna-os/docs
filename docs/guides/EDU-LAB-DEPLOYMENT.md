# Educational Computer Lab Deployment Guide

TunaOS gives lab administrators in schools and universities a container-managed base image. It lowers the maintenance work and gives each student the same environment at every boot.

## Key Benefits for Educational Institutions

1. **Zero-Drift System Files**: A student cannot change the system files in `/usr`. A reboot returns those files to the lab image. Student files in `/home` stay on the disk until you clear them.
2. **Central Updates from OCI**: Control 100 or more lab machines from one place. Push a new container image to a local registry or to a public one.
3. **Curriculum Software as Flatpaks**: Add the tools for the course (LibreOffice, GIMP, VS Code, GeoGebra) as Flatpaks. They bring their own dependencies.

## Deployment Architecture

- **Base OS**: TunaOS Bonito (Fedora base) for newer packages, or Skipjack (CentOS Stream 10 base) for a longer support life.
- **Update Mechanism**: A nightly systemd timer that runs `bootc update` and pulls the new image.
- **User Sessions**: Set up guest sessions that reset, through the GDM or LightDM configuration.

Set up the session reset and test it on one machine before you deploy the image to the lab. The base image does not clear student files on its own.
