# Educational Computer Lab Deployment Guide

TunaOS gives lab administrators in schools and universities a container-managed base image. It lowers the maintenance work and gives each student the same environment at every boot.

## Key Benefits for Educational Institutions

1. **Zero-Drift System Files**: A student cannot change the system files in `/usr`. A reboot returns those files to the lab image. Student files in `/home` stay on the disk until you clear them.
2. **Central Updates from OCI**: Control 100 or more lab machines from one place. Push a new container image to a local registry or to a public one.
3. **Curriculum Software as Flatpaks**: Add the tools for the course (LibreOffice, GIMP, VS Code, GeoGebra) as Flatpaks. They bring their own dependencies.

## Deployment Architecture

A computer lab runs many identical machines. TunaOS makes them identical on purpose. Every machine starts from the same signed OCI image. The system files in `/usr` stay read-only. The writable areas hold only user data and installed apps.

You build one image that holds the lab baseline. You push it to a registry. Each machine pulls it on a timer. When you want to change the lab, you rebuild the image and push a new tag. The machines take the new image on their next update.

The base OS is TunaOS Bonito (Fedora base) for newer packages, or Skipjack (CentOS Stream 10 base) for a longer support life. Pick one and keep the lab on it. Mixing bases makes updates hard to follow.

```text
            ┌─────────────────────────────────┐
            │         Your registry            │
            │   lab-image:2026-09-01 (signed)  │
            └─────────────────────────────────┘
                     ▲ bootc upgrade, pulls
                     │
   ┌─────────────────┼─────────────────┐
   ▼                 ▼                 ▼
┌────────┐      ┌────────┐      ┌────────┐
│ Workstation 1 │  │ Workstation 2 │  │ Workstation 3 │
│ Bonito + Flatpaks          │  │ session reset   │
└────────┘      └────────┘      └────────┘
```

Each workstation runs the same image. The desktop holds the curriculum Flatpaks. A systemd timer pulls a new image each night. A guest session resets the user state at logout.

## Prerequisites

Before you build the image, gather these items:

- **Hardware**: Lab machines that support a secure boot and a TPM 2.0 chip. Most machines from the last five years have both.
- **Network**: A LAN with DHCP. A single VLAN for the lab keeps the machines apart from the staff network.
- **Registry**: A registry you control. A small lab can use a public registry. A district should run a local registry so updates stay fast and offline.
- **Accounts**: One account with write access to the registry. One account to manage the machines.
- **Roles**: One person to build and sign the image. One person to approve and push updates. Keep these two steps apart.

## Step-by-Step Deployment

### Step 1: Choose the base image

Start from a published TunaOS image. Bonito gives the newest packages. Skipjack gives a longer support life. Pick one base and use it for the whole lab.

### Step 2: Build the lab image

Make the lab image on top of the base. Add the curriculum apps as Flatpaks. Add the lab policy. Build the image with `podman build`.

```dockerfile
FROM ghcr.io/tuna-os/bonito:latest

# Add the curriculum apps as Flatpaks.
RUN dnf install -y flatpak && \
    flatpak remote-add --if-not-exists flathub https://flathub.org/flathub.flatpakrepo && \
    flatpak install -y flathub org.libreoffice.LibreOffice org.gimp.GIMP org.vscode.VSCode org.geogebra.Calculator

# Add the lab session reset policy.
COPY idle-timeout.conf /etc/systemd/logind.conf.d/
```

### Step 3: Push the image to your registry

Push the built image to your registry. Tag it with a date so you can see and roll back each version.

```bash
podman push registry.registry.example.com/lab-image:2026-09-01
```

### Step 4: Set the image policy

Set an image policy on the machines. The policy makes each machine check the image signature. It also blocks any image the machine does not know. This keeps a stray or a bad image out of the lab.

### Step 5: Provision the machines

Put the image on the machines in three ways.

- **ISO**: Burn the TunaOS ISO to a USB drive. Install the image on a blank disk.
- **Cloud-init**: Use the cloud image for lab machines that run in a virtual lab.
- **PXE**: Boot many machines at once over the network. Use PXE to install the image on all of them in one night.

### Step 6: Add curriculum software as Flatpaks

Add the course tools as Flatpaks in the image (see Step 2). Flatpaks keep their own libraries. They update on their own schedule. They never touch the read-only system files.

### Step 7: Set up session reset

Configure a guest session that resets on logout. GDM or LightDM clears the user state at logout. Add a systemd-logind drop-in to reboot on inactivity.

```ini
# /etc/systemd/logind.conf.d/idle-timeout.conf
[Login]
IdleAction=reboot
IdleActionSec=20min
```

### Step 8: Verify one machine

Set up one workstation end to end. Confirm these items before you touch the rest:

- The machine pulls the image from your registry.
- The curriculum Flatpaks open and run.
- A guest logout returns the desktop to the clean state.
- A reboot restores the read-only system files.

### Step 9: Roll out to the fleet

Push the image to every machine. Set the systemd timer to pull a new image each night. Watch the first few machines take the update. Then let the rest follow.

### Step 10: Troubleshooting checklist

Use this list when a lab machine misbehaves:

- **Machine will not pull the image**: Check the network path to the registry. Check the image policy allows your registry.
- **An app is missing**: Rebuild the image with the app. Push a new tag. Run `sudo bootc upgrade` on the machine and reboot.
- **The desktop looks wrong after a reboot**: A student changed a system file. Check the image policy and the signature. Rebuild the image if it drifted.
- **The session does not reset**: Check the guest session and the idle-timeout drop-in. Test them on one machine first.

## Real-World Example

A six-person IT team runs a 30-machine computer lab for a community college. They build one Bonito image. It holds LibreOffice, GIMP, and GeoGebra as Flatpaks. They push the image to a local registry on their LAN. Each machine pulls it nightly with a systemd timer. A guest session resets the desktop every logout.

Idle machines reboot after 20 minutes.

The team changes the lab once a semester. They rebuild the image with the new software. They push a new dated tag. The machines take the update on their next nightly pull. No person visits a single machine to update software.

## Maintaining the Lab

Keep the lab clean over a long time. A few small habits help.

- **Update on a Schedule**: Pull new images each month. Test the update on one machine first. Then let the fleet follow.
- **Watch the Registry**: Keep the last ten image tags. Delete old tags to save space. Never delete the tag you run on.
- **Rebuild Once a Year**: Make a new image each year with the newest base. Move the lab to the new base. Test it on one machine first.
- **Keep a Rollback Image**: Keep the last image tag that worked. A bad update then cannot leave the lab with nothing to fall back on.

- **Document the Image**: Keep a short note of the packages and apps in each image. A new person can then rebuild the image if the builder leaves.
- **Check the Firmware**: Run the system requirements each year. A new machine may need a firmware update to take a new image.

## Links and Next Steps

- [Choose a Variant](../choosing-a-variant.md) — pick the base that fits your lab.
- [Layer an Image](../layering.md) — add packages and apps to a TunaOS image.
- [Bootc Resources](../bootc-resources.md) — learn how machines pull and update images.
- [System Requirements](../system-requirements.md) — hardware and firmware the machines need.
- [Community](../community.md) — ask the TunaOS community for help.
