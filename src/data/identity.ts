// The tunaOS identity, vendored from tuna-os/tunaOS into static/img/identity/
// (see the README there). Two forms:
//
// - The wordmark (lettermark) is for wide contexts: headers, cards, the hero.
//   It has a light-background file and a `-dark` file for dark backgrounds.
// - The Noto emoji mark is for small icons: table rows, picker options, the
//   navbar and the favicon.
//
// A variant without its own file falls back to the master emoji mark.

// Variants that ship both a wordmark and an emoji mark in tunaOS.
const WITH_IDENTITY: Record<string, true> = {
  albacore: true,
  bonito: true,
  'bonito-rawhide': true,
  flounder: true,
  'flounder-sid': true,
  grouper: true,
  guppy: true,
  gurnard: true,
  hummingbird: true,
  marlin: true,
  sailfin: true,
  skipjack: true,
  wahoo: true,
  yellowfin: true,
};

export const MASTER_MARK = '/img/identity/emoji/tunaos.svg';

export function emojiMarkFor(variantId: string): string {
  return WITH_IDENTITY[variantId] ? `/img/identity/emoji/${variantId}.svg` : MASTER_MARK;
}

export interface WordmarkSources {
  light: string;
  dark: string;
}

// Null when the variant has no wordmark. The caller then shows the emoji mark.
export function wordmarkFor(variantId: string): WordmarkSources | null {
  if (!WITH_IDENTITY[variantId]) return null;
  return {
    light: `/img/identity/wordmarks/${variantId}.svg`,
    dark: `/img/identity/wordmarks/${variantId}-dark.svg`,
  };
}

// Desktop logos that ship in static/img/desktops/. Monochrome marks, so they
// take the ink colour through a filter rather than carrying their own.
const DESKTOP_LOGOS = new Set(['gnome', 'kde', 'cosmic', 'niri', 'xfce']);

export function desktopLogo(tag: string): string | null {
  const base = tag.replace(/^gnome\d+$/, 'gnome');
  return DESKTOP_LOGOS.has(base) ? `/img/desktops/${base}.svg` : null;
}
