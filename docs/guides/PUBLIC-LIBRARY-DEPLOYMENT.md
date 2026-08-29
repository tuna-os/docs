# Public Library & Civic Terminal Deployment Guide

TunaOS gives public libraries and civic technology centers a desktop base that puts itself back to a known state. It needs little day-to-day work from staff.

## Key Benefits for Public Workstations

1. **Patron Privacy**: Set up the terminal with a session that resets. At logout or reboot the machine discards the browser history, the downloads, and the saved credentials from that session.
2. **Immutable System Baseline**: The system files in `/usr` stay read-only. A patron cannot change a system binary, a driver, or the installed software.
3. **Central Updates from OCI**: Look after a fleet of public terminals from one place. Schedule `bootc update` against a standard container registry.

## System Configuration Highlights

- **Desktop Baseline**: TunaOS Yellowfin (GNOME) or Skipjack (KDE Plasma), with a guest account that logs in on its own.
- **Web Browser**: Firefox or Chromium as a Flatpak, with your own privacy defaults in place before the terminal goes out.
- **Session Reset**: A reboot after 15 minutes with no input, and a reboot on manual logout.

Test the reset behaviour on one terminal before you put the image on the floor. What each session keeps depends on the browser and the display manager you configure, not on the base image alone.
