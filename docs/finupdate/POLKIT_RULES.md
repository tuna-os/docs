---
sidebar_position: 6
title: "POLKIT RULES"
---

## Overview

Finupdate requires elevated privileges to interact with bootc and system management operations. This document describes the Polkit rules configured to allow these operations without interactive password prompts during testing and routine use.

## Rule: `/etc/polkit-1/rules.d/49-finupdate.rules`

### Purpose
Allows the `james` user and members of the `wheel` group to execute bootc commands (status, upgrade, etc.) and system reboot operations without password prompts. Designed for:
- Automated testing in CI/CD environments
- Development/debug mode operations
- Non-destructive command verification (bootc status, upgrade checks)

### Configuration
```javascript
polkit.addRule(function(action, subject) {
    // Allow james to run bootc commands without password (non-destructive for testing)
    if (subject.user == "james") {
        // All bootc operations: status, upgrade, etc.
        if (action.command && action.command.indexOf("bootc") >= 0) {
            return polkit.Result.YES;
        }
        // Allow systemctl reboot for integration testing
        if (action.id == "org.freedesktop.login1.reboot") {
            return polkit.Result.YES;
        }
    }
});
```

### Operations Authorized

#### bootc commands (all variants)
- `bootc status --json` — Query current OS image metadata
- `bootc status` — Human-readable status output
- `bootc upgrade` — Stage image upgrades
- `bootc upgrade --check` — Check for available upgrades

Executed via:
- Direct: `pkexec bootc <command>`
- From Flatpak: `flatpak-spawn --host pkexec bootc <command>`

#### System reboot
- `systemctl reboot` — Initiate system restart
- Polkit action: `org.freedesktop.login1.reboot`

### Security Notes

**Scope**: Limited to the `james` user. Does not grant blanket `sudo` privileges or arbitrary root command execution.

**Assumptions**: This configuration assumes the `james` user is trusted with system administration. On the Dakota image, `james` already has passwordless `sudo` (NOPASSRC: ALL), so this aligns with existing security posture rather than introducing new privilege escalation.

**Non-destructive intent**: The rule authorizes operations that are necessary for update checking and management, not arbitrary system modification. The finupdate application enforces additional safeguards:
- Dev mode prevents actual reboots
- Simulation scenarios allow safe testing without touching the real system

### Installation

The rule is deployed during system setup or when finupdate is initialized:

```bash
sudo tee /etc/polkit-1/rules.d/49-finupdate.rules > /dev/null << 'EOF'
polkit.addRule(function(action, subject) {
    if (subject.user == "james") {
        if (action.command && action.command.indexOf("bootc") >= 0) {
            return polkit.Result.YES;
        }
        if (action.id == "org.freedesktop.login1.reboot") {
            return polkit.Result.YES;
        }
    }
});
EOF
```

### Verification

Test that rules are in effect:

```bash
# Should complete without password prompt
flatpak-spawn --host pkexec bootc status --json

# Should show current deployment info
pkexec bootc status
```

### Upstream Proposal

This rule is intended as a model for upstreaming into the Dakota OS layer or a finupdate system package. The specific actions (bootc status, reboot) are legitimate for any system update tool and could be generalized for broader use.

## Related Issues

- **AT-SPI testing dependencies**: See `docs/GUI_TESTING.md` for notes on `gnome-ponytail-daemon` requirement for automated GUI tests.

## References

- [Polkit Documentation](https://www.freedesktop.org/software/polkit/docs/latest/)
- [systemd-logind D-Bus Interface](https://dbus.freedesktop.org/doc/org.freedesktop.login1.html)
- [bootc Documentation](https://containers.github.io/bootc/)
