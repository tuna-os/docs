// Variant marks — the flat vector marks from tuna-os/branding, vendored into
// static/img/marks/ (see the README there). One accent per variant, each
// species drawn by its real field mark, so a variant reads as itself on a card
// without a second colour system in the interface around it.
//
// Not every base has a mark yet. Rolling-release siblings borrow their
// parent's — they are the same species — and anything else falls back to the
// master TunaOS mark rather than shipping a gap.

const MARKS: Record<string, string> = {
  albacore: 'albacore',
  yellowfin: 'yellowfin',
  skipjack: 'skipjack',
  bonito: 'bonito',
  marlin: 'marlin',
  flounder: 'flounder',
  grouper: 'grouper',
  guppy: 'guppy',
  // Rolling siblings: same fish, faster branch.
  'bonito-rawhide': 'bonito',
  'flounder-sid': 'flounder',
};

export const MASTER_MARK = '/img/marks/tunaos.svg';

export function markFor(variantId: string): string {
  const name = MARKS[variantId];
  return name ? `/img/marks/${name}.svg` : MASTER_MARK;
}

// True when the variant has a mark of its own. Surfaces that would rather show
// nothing than repeat the master mark can ask.
export function hasOwnMark(variantId: string): boolean {
  return variantId in MARKS;
}

// Desktop logos that ship in static/img/desktops/. Monochrome marks, so they
// take the ink colour through a filter rather than carrying their own.
const DESKTOP_LOGOS = new Set(['gnome', 'kde', 'cosmic', 'niri', 'xfce']);

export function desktopLogo(tag: string): string | null {
  const base = tag.replace(/^gnome\d+$/, 'gnome');
  return DESKTOP_LOGOS.has(base) ? `/img/desktops/${base}.svg` : null;
}
