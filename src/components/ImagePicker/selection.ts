import {VARIANTS} from '@site/src/data/variants';
import {ISO_BASE_URL} from '@site/src/utils/isoNaming';
import {markFor} from '@site/src/data/marks';

// Pure release-selection policy for the image picker: option catalogs, the
// step-flow state machine, and the derived image/ISO/docs URLs for a
// selection. No React import — index.tsx owns rendering only.
//
// Extracted from index.tsx (tuna-os/docs#414): this policy used to live
// alongside the rendering components, with no test surface except
// rendering the whole wizard. Two real defects originated here before this
// split — the variant list once hardcoded just 4 of the 12 published
// variants, and getIsoUrl once hardcoded HWE/NVIDIA/GNOME 50 combos as
// always unavailable for variant+desktop pairs where an ISO actually
// exists.

export type Variant = string;
export type Desktop = 'gnome' | 'gnome50' | 'kde' | 'cosmic' | 'niri' | 'pantheon';
export type Edition = 'standard' | 'nvidia' | 'hwe' | 'cachyos';
export type Product = 'tunaos' | 'dakota' | 'tromso' | 'xfce';
export type StepId = 'product' | 'variant' | 'desktop' | 'edition' | 'result';

export type Selection = {
  product?: Product;
  variant?: Variant;
  desktop?: Desktop;
  edition?: Edition;
};

// Rolling-release siblings that ride the same desktop/edition catalog as
// their stable base — kept out of the main variant grid so the picker
// doesn't present 12 equally-weighted choices, but still reachable from
// their parent's card.
export const ROLLING_SIBLING_OF: Record<string, string> = {
  'bonito-rawhide': 'bonito',
  'flounder-sid': 'flounder',
};

export type Option<T extends string> = {
  value: T;
  // Variant options carry their branding mark; the other steps have none.
  mark?: string;
  label: string;
  description: string;
  badge?: string;
};

export const PRODUCT_OPTIONS: Option<Product>[] = [
  {
    value: 'tunaos',
    label: 'TunaOS',
    description: 'Enterprise Linux desktops — Albacore, Yellowfin, Skipjack, Bonito.',
    badge: 'Most popular',
  },
  {
    value: 'dakota',
    label: 'Dakota (Bluefin)',
    description: 'GNOME OS built from source. The reference BuildStream desktop.',
  },
  {
    value: 'tromso',
    label: 'Tromsø',
    description: 'Aurora KDE Plasma 6 — built from source on freedesktop-sdk.',
  },
  {
    value: 'xfce',
    label: 'XFCE Linux',
    description: 'Lightweight XFCE Wayland — built from source on freedesktop-sdk.',
  },
];

// Sourced from the same VARIANTS data that drives the variant landing pages,
// so this list can't silently fall behind as new bases are added (it used to
// hardcode just 4 of the 12 published variants). Rolling-release siblings
// (Bonito Rawhide, Flounder Sid) are excluded here and offered as a
// secondary choice under their parent's card instead.
export const VARIANT_OPTIONS: Option<Variant>[] = VARIANTS.filter((v) => !(v.id in ROLLING_SIBLING_OF)).map((v) => ({
  value: v.id,
  mark: markFor(v.id),
  label: v.name,
  description: v.blurb,
  badge: v.recommended ? 'Recommended' : undefined,
}));

export const DESKTOP_OPTIONS: Option<Desktop>[] = [
  {
    value: 'gnome',
    label: 'GNOME',
    description: 'The polished default. GNOME 50 backported to Enterprise Linux.',
    badge: 'Default',
  },
  {
    value: 'gnome50',
    label: 'GNOME 50',
    description: 'Next-generation GNOME — if you want to live on the bleeding edge of the desktop.',
  },
  {
    value: 'kde',
    label: 'KDE Plasma',
    description: 'Highly customizable. Familiar if you\'re coming from Windows.',
  },
  {
    value: 'cosmic',
    label: 'COSMIC',
    description: 'New Rust-built desktop from System76. Modern and fast.',
  },
  {
    value: 'niri',
    label: 'Niri',
    description: 'Unique scrollable tiling Wayland compositor. For the keyboard-driven power user.',
  },
  {
    value: 'pantheon',
    label: 'Pantheon',
    description: 'The elegant, minimal elementary OS desktop.',
  },
];

// Catalog of every possible edition; which ones actually apply to a given
// variant is looked up from that variant's real `editions` list (sourced
// from build-config.yml) via getEditionOptions() below — so a base that
// doesn't build an HWE or NVIDIA flavor (Sailfin, Guppy, Grouper, Flounder,
// Flounder Sid) never even offers the choice, and Marlin's real third
// edition (a CachyOS kernel overlay) shows up instead of a fake NVIDIA/HWE
// option it doesn't have.
export const EDITION_CATALOG: Record<Edition, Option<Edition>> = {
  standard: {
    value: 'standard',
    label: 'Standard',
    description: 'Just the desktop — great for everyday use.',
  },
  nvidia: {
    value: 'nvidia',
    label: 'AI / ML (NVIDIA)',
    description: 'Adds NVIDIA drivers and CUDA support for AI/ML, graphics, and VFX workloads.',
  },
  hwe: {
    value: 'hwe',
    label: 'New Hardware (HWE)',
    description: 'A newer kernel for very recent hardware like the latest AMD and Intel platforms.',
  },
  cachyos: {
    value: 'cachyos',
    label: 'CachyOS kernel',
    description: 'The performance-tuned CachyOS kernel overlay on the same Arch userspace.',
  },
};

export function getEditionOptions(variantId: Variant | undefined): Option<Edition>[] {
  const variant = VARIANTS.find((v) => v.id === variantId);
  const extra = variant?.editions ?? [];
  return [EDITION_CATALOG.standard, ...extra.map((e) => EDITION_CATALOG[e])];
}

// Only offer desktops a variant actually ships (from the same VARIANTS data
// that drives its landing page). Base-only variants like Hummingbird end up
// with an empty list, which skips the desktop step entirely.
export function getDesktopOptions(variantId: Variant | undefined): Option<Desktop>[] {
  if (!variantId) return DESKTOP_OPTIONS;
  const variant = VARIANTS.find((v) => v.id === variantId);
  if (!variant) return DESKTOP_OPTIONS;
  const tags = new Set(variant.desktops.map((d) => d.tag));
  return DESKTOP_OPTIONS.filter((o) => tags.has(o.value));
}

export function hasDesktopOptions(variantId: Variant | undefined): boolean {
  return getDesktopOptions(variantId).length > 0;
}

export const STEP_LABELS: Record<StepId, string> = {
  product: 'Product',
  variant: 'Base',
  desktop: 'Desktop',
  edition: 'Edition',
  result: 'Your Image',
};

// The suffix a given edition appends to a desktop tag, matching build-config.yml
// flavor ids exactly (gnome-nvidia, gnome-hwe, gnome-cachyos, ...).
export function editionSuffix(edition: Edition | undefined): string {
  if (edition === 'nvidia') return '-nvidia';
  if (edition === 'hwe') return '-hwe';
  if (edition === 'cachyos') return '-cachyos';
  return '';
}

// True when the selected variant only builds the standard edition — the
// edition step has nothing to offer, so it's skipped entirely rather than
// showing a one-option "choice."
export function hasExtraEditions(variantId: Variant | undefined): boolean {
  return getEditionOptions(variantId).length > 1;
}

export function getNextStep(step: StepId, sel: Selection): StepId {
  if (step === 'product') {
    if (sel.product === 'tunaos') return 'variant';
    return 'result'; // skip to result for non-tunaOS products
  }
  if (step === 'variant') return hasDesktopOptions(sel.variant) ? 'desktop' : 'result';
  if (step === 'desktop') return hasExtraEditions(sel.variant) ? 'edition' : 'result';
  if (step === 'edition') return 'result';
  return 'result';
}

export function getPrevStep(step: StepId, sel: Selection): StepId | null {
  if (step === 'variant') return 'product';
  if (step === 'desktop') return 'variant';
  if (step === 'edition') return 'desktop';
  if (step === 'result') {
    if (sel.product !== 'tunaos') return 'product';
    return hasDesktopOptions(sel.variant) ? (hasExtraEditions(sel.variant) ? 'edition' : 'desktop') : 'variant';
  }
  return null;
}

export function buildImageName(sel: Selection): string {
  const variant = sel.variant ?? 'albacore';
  // Base-only variants (e.g. Hummingbird) have no desktop step; fall back to
  // their sole published flavor tag instead of a desktop that doesn't exist.
  const desktop = sel.desktop ?? (getDesktopOptions(sel.variant)[0]?.value ?? 'base');
  return `ghcr.io/tuna-os/${variant}:${desktop}${editionSuffix(sel.edition)}`;
}

export function getIsoUrl(sel: Selection, isoNames: Set<string> | null): string | null {
  // Non-tunaOS products
  if (sel.product === 'dakota') return 'https://download.tunaos.org/dakota/dakota-live-latest.iso';
  if (sel.product === 'tromso') return 'https://download.tunaos.org/tromso/tromso-live-latest.iso';
  if (sel.product === 'xfce') return 'https://download.tunaos.org/xfce-linux/xfce-linux-live-latest.iso';
  // TunaOS variants — validated against the live ISO index (static/iso-index.json)
  // rather than guessed, so this never wrongly claims an HWE/NVIDIA/GNOME 50
  // combo is or isn't downloadable. (HWE ISOs, for example, do exist for some
  // variant+desktop pairs — this used to hardcode them as always unavailable.)
  if (!sel.variant || !sel.desktop) return null;
  if (VARIANTS.find((v) => v.id === sel.variant)?.localBuildOnly) return null;
  const name = `${sel.variant}-${sel.desktop}${editionSuffix(sel.edition)}-latest`;
  if (!isoNames || !isoNames.has(name)) return null;
  return `${ISO_BASE_URL}/${name}.iso`;
}

// iso.tunaos.org accepts the image as a URL parameter, so a picked image can
// be handed straight to the in-browser builder (see /iso-builder).
export const BUILDER_URL = 'https://iso.tunaos.org';

export function getBuilderUrl(imageName: string): string {
  const short = imageName.replace(/^ghcr\.io\//, '');
  return `${BUILDER_URL}/?image=${encodeURIComponent(short)}`;
}

export function getDocsUrl(sel: Selection): string {
  if (sel.product === 'dakota') return '/dakota';
  if (sel.product === 'tromso') return '/tromso';
  if (sel.product === 'xfce') return '/xfce-linux';
  const variant = sel.variant ?? 'albacore';
  const desktop = sel.desktop ?? (getDesktopOptions(sel.variant)[0]?.value ?? 'base');
  return `/docs/${variant}#${desktop}${editionSuffix(sel.edition)}`;
}

export function getVisibleSteps(sel: Selection): StepId[] {
  if (sel.product !== 'tunaos') return ['product', 'result'];
  const steps: StepId[] = ['product', 'variant'];
  if (hasDesktopOptions(sel.variant)) steps.push('desktop');
  if (hasExtraEditions(sel.variant)) steps.push('edition');
  steps.push('result');
  return steps;
}
