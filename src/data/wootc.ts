// The TunaOS-branded wootc installer. GitHub's releases/latest/download/<name>
// redirect follows the newest non-prerelease, and every wootc release since
// v0.1.0-alpha.1 ships an asset with this exact name, so the link never needs
// a version bump. The size is the v0.1.0-alpha.1 asset (12,460,544 bytes);
// the later nightly builds of the same file are within a few KB of it.
export const WOOTC_INSTALLER_URL =
  'https://github.com/tuna-os/wootc/releases/latest/download/TunaOS-Installer.exe';
export const WOOTC_INSTALLER_SIZE = '12 MB';
