---
sidebar_position: 28
title: "network agent"
---

Tuna Desktop registers `org.gnome.Shell.NetworkAgent` on the system bus. Requests
are accepted only from NetworkManager's current unique bus owner. A newer
request or CancelGetSecrets dismisses the old prompt and invalidates its
pending asynchronous helper work.

The shell asks for WPA/SAE and WEP secrets, 802.1X identity/password hints,
PEAP/TTLS/FAST passwords, TLS private-key passwords and mobile broadband
PINs. Existing identities remain read-only when NetworkManager did not ask
for them. Certificate files, trust roots, EAP method selection and a new
enterprise connection's initial configuration stay in Settings, as in
GNOME 51's [network agent](https://github.com/GNOME/gnome-shell/blob/51.0/js/ui/components/networkAgent.js).

VPN prompts use the installed NetworkManager plugin's GNOME authentication
helper with `--external-ui-mode`. Tuna Desktop sends connection data and secrets
through stdin, reads the plugin's version 2 keyfile, and displays its title,
description and requested fields. It returns the nested VPN secrets
dictionary including supplied noninteractive values. Plugins without this
external-UI capability are reported as unsupported; legacy plugin-owned
windows are not implemented. Helpers have a 30 second deadline.

Agent-owned user secrets use libsecret's `secret-tool` and the same
`connection-uuid`, `setting-name` and `setting-key` attributes as GNOME's
[ShellNetworkAgent](https://github.com/GNOME/gnome-shell/blob/51.0/src/shell-network-agent.c).
Secret values travel through stdin/stdout and are never command arguments
or shell logs. System-owned and always-ask secrets are not stored. Requests
without ALLOW_INTERACTION reuse stored values; REQUEST_NEW ignores stored
passwords. SaveSecrets and DeleteSecrets use the same keyring attributes.
The session needs an unlocked Secret Service provider such as GNOME Keyring;
a missing provider or failed store returns an error rather than claiming
that a user secret was remembered.

When NetworkManager lists several wired adapters, the Wired menu gives
each interface an expandable submenu. A single adapter keeps the direct
connection rows. Changes follow NetworkManager device and property signals.

When NetworkManager reports a captive portal on the activated primary
connection, the shell posts "Sign in to Network" as GNOME 51 does;
activating it calls `org.gnome.Shell.PortalHelper.Authenticate` on the
session bus. That helper ships with gnome-shell (`gnome-shell-portal-helper`,
D-Bus activated). When the name is not activatable the shell logs once
and offers nothing.

The GTK proof adds `G-NM-ENTERPRISE`, `G-NM-VPN` and `G-NM-WIRED`: a real
private GNOME Keyring stores, reuses and deletes an agent-owned EAP password;
a TLS request asks for its key password; a VPN helper supplies the external
UI prompt and checks the secrets reply; and a second wired adapter adds
separate submenus. The NetworkManager daemon side is a D-Bus stub. These
proofs do not establish successful authentication against physical 802.1X
infrastructure or a live VPN server.
