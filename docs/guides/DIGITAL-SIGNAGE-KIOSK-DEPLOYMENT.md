# Digital Signage & Kiosk Fleet Deployment Guide

TunaOS gives fleet administrators a container-managed base image for signage screens and interactive kiosks that run without an operator present.

## Key Advantages for Kiosk & Signage Fleets

1. **Resistant to Power Loss**: The core system files in `/usr` are read-only. Nothing writes to them, so a sudden power cut does not leave a system binary half-written. The writable areas such as `/var` can still take damage. A power cut in the middle of an update can still stop the next boot.
2. **Central Fleet Management with OCI**: Push a new container tag to a standard registry. Every screen picks it up on its next scheduled update.
3. **Single-App Kiosk Isolation**: Run one full-screen application in an unprivileged container sandbox at start-up. Use Chromium, MPV, or your own web app.

## Deployment Architecture

A signage or kiosk fleet runs many screens with no operator at each one. TunaOS keeps them uniform. Every screen starts from the same signed OCI image. The system files in `/usr` stay read-only. The writable areas hold only the runtime data of the one app.

You build one image that holds the base OS and the kiosk app. You push it to a registry. Each screen pulls it on a timer. When you change the app or the content, you rebuild the image and push a new tag. The screens take the new image on their next update. You never touch a screen by hand.

The base OS is a light TunaOS variant such as XFCE Linux or Bonito Niri. Set it to log in on its own with no desktop shell. Pick one base and keep the fleet on it.

```text
             ┌───────────────────────────────────┐
             │          Your registry            │
             │  kiosk-screen:2026-09-01 (signed) │
             └───────────────────────────────────┘
                  ▲ bootc upgrade, pulls at night
                  │
    ┌─────────────┼─────────────┐
    ▼             ▼             ▼
 ┌───────┐   ┌───────┐   ┌───────┐
 │Screen A│  │Screen B│  │Screen C│
 │Kiosk app full-screen   │  │no operator present │
 └───────┘   └───────┘   └───────┘
```

Each screen runs the same image. The app runs full-screen in an unprivileged sandbox. A systemd timer pulls a new image each night. The screens never need a person to update them.

## Prerequisites

Before you build the image, gather these items:

- **Hardware**: Screens and kiosks that support a secure boot and a TPM 2.0 chip. Low-power mini PCs work well for indoor kiosks.
- **Network**: A LAN with internet access. The screens pull updates from your registry and fetch content from your content server.
- **Registry**: A registry you control. A small fleet can use a public registry. A multi-site fleet should run a local registry so updates stay fast.
- **Accounts**: One account with write access to the registry. One account to manage the screens.
- **Roles**: One person to build and sign the image. One person to approve and push updates. Keep these two steps apart.

## Step-by-Step Deployment

### Step 1: Choose the base image

Start from a published image in a light TunaOS variant. XFCE Linux gives a full desktop you can hide. Bonito Niri gives a light shell for the app. Pick one base and use it for the whole fleet.

### Step 2: Build the kiosk image

Make the kiosk image on top of the base. Add the kiosk app. Set it to run full-screen. Build the image with `podman build`.

```dockerfile
FROM ghcr.io/tuna-os/xfce-linux:latest

# Add the kiosk app as a Flatpak and launch it full-screen.
RUN dnf install -y flatpak && \
    flatpak remote-add --if-not-exists flathub https://flathub.org/flathub.flatpakrepo && \
    flatpak install -y flathub org.chromium.Chromium

# Start the browser full-screen at login.
COPY kiosk-entrypoint.sh /usr/local/bin/kiosk-entrypoint.sh
```

### Step 3: Launch the app full-screen

Start the app at login with the browser in kiosk mode. Pass the URL of your content server. The app fills the screen with no browser chrome.

```bash
#!/bin/sh
exec flatpak run org.chromium.Chromium --kiosk --incognito https://signage.internal.example.com
```

### Step 4: Push the image to your registry

Push the built image to your registry. Tag it with a date. A dated tag lets you see and roll back each version.

```bash
podman push registry.registry.example.com/kiosk-screen:2026-09-01
```

### Step 5: Set the image policy

It also blocks any image the screen does not know. This keeps a stray or a bad image off the wall.

### Step 6: Provision the screens

Put the image on the screens in three ways.

- **ISO**: Burn the TunaOS ISO to a USB drive. Install the image on a blank disk.
- **Cloud-init**: Use the cloud image for screens that run in a virtual lab.
- **PXE**: Boot many screens at once over the network. Use PXE to install the image on all of them in one night.

### Step 7: Set up unattended updates

Add a systemd timer that pulls a new image each night. Run the update in the quiet hours. The screens take the new image on their next timer.

```ini
# /etc/systemd/system/bootc-fetch-apply-updates.timer.d/schedule.conf
[Timer]
OnCalendar=
OnCalendar=*-*-* 03:00:00
Persistent=true
```

This drop-in moves the `bootc-fetch-apply-updates.timer` that bootc ships to 03:00. The timer runs `bootc upgrade --apply`, which stages the new image and reboots into it. Enable it with `sudo systemctl enable --now bootc-fetch-apply-updates.timer`.

### Step 8: Verify one screen

Set up one screen end to end. Confirm these items before you touch the rest:

- The screen pulls the image from your registry.
- The app opens full-screen with your content.
- A reboot returns the app to full-screen on its own.
- A power cut does not stop the next boot.

### Step 9: Roll out to the fleet

Push the image to every screen. Watch the first few screens take the update. Then let the rest follow.

### Step 10: Troubleshooting checklist

Use this list when a screen misbehaves:

- **Screen will not pull the image**: Check the network path to the registry. Check the image policy allows your registry.
- **The app will not open**: Check the app command in the login script. Check the Flatpak is in the image.
- **The screen froze**: A power cut may have damaged the writable areas. Reinstall the image from the ISO.
- **The content is stale**: The content server did not update. Check the content server and the app URL.

## Real-World Example

A city runs 60 information kiosks in three buildings. They build one XFCE image. It runs Chromium full-screen against their content server. They push the image to a local registry on their LAN. Each screen pulls it nightly with a systemd timer. A reboot returns the app to full-screen on its own.

The city changes the content once a week. The content server serves new pages. The app shows the new content on its next fetch. The city changes the app design once a year. They rebuild the image with the new app. They push a new dated tag.

The screens take the update on their next nightly pull. No technician visits a kiosk to update software.

## Maintaining the Fleet

Keep the screens clean over a long time. A few small habits help.

- **Update on a Schedule**: Pull new images each month. Test the update on one screen first. Then let the fleet follow.
- **Watch the Registry**: Keep the last ten image tags. Delete old tags to save space. Never delete the tag you run on.
- **Rebuild Once a Year**: Make a new image each year with the newest base. Move the fleet to the new base. Test it on one screen first.
- **Keep a Rollback Image**: Keep the last image tag that worked. A bad update then cannot leave the fleet with nothing to fall back on.

## Links and Next Steps

- [Choose a Variant](../choosing-a-variant.md) — pick the light base that fits your screens.
- [Layer an Image](../layering.md) — add the kiosk app to a TunaOS image.
- [Bootc Resources](../bootc-resources.md) — learn how machines pull and update images.
- [System Requirements](../system-requirements.md) — hardware and firmware the screens need.
- [Community](../community.md) — ask the TunaOS community for help.
