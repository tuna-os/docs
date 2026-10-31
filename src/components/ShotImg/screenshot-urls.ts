// Where the workflow screenshots live. Kept free of imports so that
// scripts/__tests__/screenshot-urls.test.mjs can load it with plain Node.
//
// tuna-os/tunaOS publishes each `-latest` PNG to the rolling `screenshots`
// GitHub release and, for now, to R2. The asset name is the R2 key without
// `screenshots/`, with each `/` written as `__`
// (tunaOS docs/SCREENSHOT-RELEASE.md). The release is the primary source. R2
// is the fallback while the upload there still runs, so that removing it
// cannot break a page that already loaded.

export const RELEASE_BASE = 'https://github.com/tuna-os/tunaos/releases/download/screenshots';
export const R2_BASE = 'https://download.tunaos.org/screenshots';

// `path` is the R2 key without `screenshots/`, for example
// `yellowfin-gnome-latest.png` or `installer/cosmic_01_welcome-latest.png`.
export function releaseUrl(path: string): string {
  return `${RELEASE_BASE}/${path.split('/').join('__')}`;
}

export function r2Url(path: string): string {
  return `${R2_BASE}/${path}`;
}

// Sources in the order to try them.
export function screenshotSources(path: string): string[] {
  return [releaseUrl(path), r2Url(path)];
}

export function desktopShotPath(variant: string, tag: string): string {
  return `${variant}-${tag}-latest.png`;
}

export function installerShotPath(prefix: string, file: string): string {
  return `installer/${prefix}${file}-latest.png`;
}
