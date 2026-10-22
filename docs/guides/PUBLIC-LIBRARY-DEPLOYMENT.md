# Public Library & Civic Terminal Deployment Guide

TunaOS gives public libraries and civic technology centers a desktop base that puts itself back to a known state. It needs little day-to-day work from staff.

## Key Benefits for Public Workstations

1. **Patron Privacy**: Set up the terminal with a session that resets. At logout or reboot the machine discards the browser history, the downloads, and the saved credentials from that session.
2. **Immutable System Baseline**: The system files in `/usr` stay read-only. A patron cannot change a system binary, a driver, or the installed software.
3. **Central Updates from OCI**: Look after a fleet of public terminals from one place. Schedule `bootc update` against a standard container registry.

## Deployment Architecture

A public terminal serves many patrons in a day. Each patron leaves no trace. TunaOS keeps this simple. The system files stay read-only. The user session resets on logout or reboot. The machine returns to the same clean state for the next patron.

You build one image that holds the desktop, the browser, and the privacy settings. You push it to a registry. Each terminal pulls it on a timer. When you want to change a terminal, you rebuild the image and push a new tag. The terminals take the new image on their next update.

The base OS is TunaOS Yellowfin (GNOME) for a familiar desktop, or Skipjack (KDE Plasma) for a lighter one. Pick one and keep the fleet on it.

```text
              ┌──────────────────────────────────┐
              │         Your registry             │
              │  library-terminal:2026-09-01(signed)│
              └──────────────────────────────────┘
                   ▲ bootc update, pulls nightly
                   │
     ┌─────────────┼─────────────┐
     ▼             ▼             ▼
  ┌──────┐     ┌──────┐     ┌──────┐
  │Terminal A│  │Terminal B│  │Terminal C│
  │Firefox Flatpak     │  │resets on logout │
  └──────┘     └──────┘     └──────┘
```

Each terminal runs the same image. The desktop holds the browser with your privacy defaults. A systemd timer pulls a new image each night. A guest session resets the user state at logout.

## Prerequisites

Before you build the image, gather these items:

- **Hardware**: Terminals that support a secure boot and a TPM 2.0 chip. Low-power mini PCs work well for public terminals.
- **Network**: A public LAN that is separate from the staff network. Keep the terminals apart from the staff network.
- **Registry**: A registry you control. A small library can use a public registry. A library system should run a local registry so updates stay fast.
- **Accounts**: One account with write access to the registry. One account to manage the terminals.
- **Roles**: One person to build and sign the image. One person to approve and push updates. Keep these two steps apart.

## Step-by-Step Deployment

### Step 1: Choose the base image

Start from a published TunaOS image. Yellowfin gives a familiar GNOME desktop. Skipjack gives a lighter desktop with KDE Plasma. Pick one base and use it for the whole fleet.

### Step 2: Build the terminal image

Make the terminal image on top of the base. Add the browser as a Flatpak. Add the privacy settings. Build the image with `bootc`.

```dockerfile
FROM quay.io/tuna-os/yellowfin:latest

# Add the browser as a Flatpak with your privacy defaults.
RUN dnf install -y flatpak && \
    flatpak remote-add --if-not-exists flathub https://flathub.org/flathub.flatpakrepo && \
    flatpak install -y flathub org.mozilla.FirefoxRepo

# Add the session reset policy.
COPY idle-timeout.conf /etc/systemd/logind.conf.d/
```

### Step 3: Push the image to your registry

Push the built image to your registry. Tag it with a date. A dated tag lets you see and roll back each version.

```bash
bootc push --tls-verify=false registry.registry.example.com/library-terminal:2026-09-01
```

### Step 4: Set the image policy

Set an image policy on the terminals. The policy makes each terminal check the image signature. It also blocks any image the terminal does not know. This keeps a stray or a bad image off the floor.

### Step 5: Provision the terminals

Put the image on the terminals in three ways.

- **ISO**: Burn the TunaOS ISO to a USB drive. Install the image on a blank disk.
- **Cloud-init**: Use the cloud image for terminals that run in a virtual lab.
- **PXE**: Boot many terminals at once over the network. Use PXE to install the image on all of them in one night.

### Step 6: Set the browser with privacy defaults

Add the browser as a Flatpak in the image (see Step 2). Set the privacy defaults before the terminal goes out. Turn off telemetry. Set a private tab as the default. Set the browser to clear history on close.

### Step 7: Set up session reset

Configure a guest session that resets on logout. The display manager clears the user state. Add a systemd-logind drop-in to reboot on inactivity.

```ini
# /etc/systemd/logind.conf.d/idle-timeout.conf
[Login]
IdleAction=reboot
IdleActionSec=15min
```

### Step 8: Verify one terminal

Set up one terminal end to end. Confirm these items before you touch the rest:

- The terminal pulls the image from your registry.
- The browser opens with your privacy defaults.
- A patron logout returns the desktop to the clean state.
- A reboot restores the read-only system files.

### Step 9: Roll out to the fleet

Push the image to every terminal. Set the systemd timer to pull a new image each night. Watch the first few terminals take the update. Then let the rest follow.

### Step 10: Troubleshooting checklist

Use this list when a terminal misbehaves:

- **Terminal will not pull the image**: Check the network path to the registry. Check the image policy allows your registry.
- **The browser looks wrong**: A patron changed a setting. Check the browser defaults in the image. Rebuild the image if they drifted.
- **The session does not reset**: Check the guest session and the idle-timeout drop-in. Test them on one terminal first.
- **The desktop is slow**: A patron filled the local disk. Check the writable areas. The immutable base should not grow.

## Real-World Example

A county library runs 40 public terminals across four branches. They build one Yellowfin image. It holds Firefox with private tabs and history cleared on close. They push the image to a local registry on their LAN. Each terminal pulls it nightly with a systemd timer. A guest session resets the desktop every logout.

Idle terminals reboot after 15 minutes.

The library staff change the browser settings once a year. They rebuild the image with the new defaults. They push a new dated tag. The terminals take the update on their next nightly pull. No staff member visits a terminal to change a setting.

## Maintaining the Fleet

Keep the terminals clean over a long time. A few small habits help.

- **Update on a Schedule**: Pull new images each month. Test the update on one terminal first. Then let the fleet follow.
- **Watch the Registry**: Keep the last ten image tags. Delete old tags to save space. Never delete the tag you run on.
- **Rebuild Once a Year**: Make a new image each year with the newest base. Move the fleet to the new base. Test it on one terminal first.
- **Keep a Rollback Image**: Keep the last image tag that worked. A bad update then cannot leave the fleet with nothing to fall back on.

- **Document the Terminal**: Keep a short note of the browser settings in each image. A new staff member can then rebuild the image if the builder leaves.

## Links and Next Steps

- [Choose a Variant](../choosing-a-variant.md) — pick the base that fits your terminals.
- [Layer an Image](../layering.md) — add the browser and apps to a TunaOS image.
- [Bootc Resources](../bootc-resources.md) — learn how machines pull and update images.
- [System Requirements](../system-requirements.md) — hardware and firmware the terminals need.
- [Ephemeral Session Reset](EPHEMERAL-SESSION-RESET.md) — reset shared workstations on inactivity.
- [Community](../community.md) — ask the TunaOS community for help.
