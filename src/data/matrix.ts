// Derives the variant x desktop build matrix purely from VARIANTS[].flavors —
// the same data that already drives each variant's landing page — so the
// matrix can never drift out of sync with what those pages claim.
//
// The static half answers "is this combination built at all". The live half
// (buildStatus) layers the release bucket's own record on top: which cells
// have a published ISO right now, when that ISO landed, how big it is, and
// which architectures and editions came with it.
import {ALL_DESKTOPS, VARIANTS} from './variants';
import type {Variant} from './variants';
import type {IsoEntry, IsoIndex} from '../hooks/useIsoIndex';
import {isoNameForImage} from '../utils/isoNaming';

export type MatrixCell = {
  available: boolean;
  hwe: boolean;
  nvidia: boolean;
  iso: boolean;
};

function tagSuffix(image: string): string {
  return image.split(':').pop() ?? '';
}

export function getMatrixCell(variant: Variant, desktopTag: string): MatrixCell {
  const matches = variant.flavors.filter((f) => {
    const suffix = tagSuffix(f.image);
    return suffix === desktopTag || suffix.startsWith(`${desktopTag}-`);
  });
  return {
    available: matches.length > 0,
    hwe: matches.some((f) => tagSuffix(f.image).includes('hwe')),
    nvidia: matches.some((f) => tagSuffix(f.image).includes('nvidia')),
    iso: matches.some((f) => (f.note ?? '').toLowerCase().includes('iso')),
  };
}

export const MATRIX_DESKTOPS = ALL_DESKTOPS;
export const MATRIX_VARIANTS = VARIANTS;

/** What the pipeline has actually produced for one variant + desktop pair. */
export type BuildStatus = {
  /** A flavor for this pair exists in the build config. */
  built: boolean;
  /** The OCI image ref, for the rebase command. */
  image: string | null;
  /** The published live ISO for the plain desktop tag, if there is one. */
  iso: IsoEntry | null;
  /** Newest build time across the ISO and its arch/edition siblings. */
  builtAt: string | null;
  /** Architectures seen among the published ISOs for this pair. */
  arches: string[];
  nvidia: boolean;
  hwe: boolean;
  /** Total bytes published for this pair, across every sibling. */
  bytes: number;
  /** How many ISOs the bucket holds for this pair, arch/edition siblings included. */
  builds: number;
  /** RHEL's terms mean Redfin has no public image or ISO — only a local build. */
  localOnly: boolean;
  /** The live index has not arrived yet, so ISO state is not known either way. */
  pending: boolean;
};

const ARCH_LABELS: Record<string, string> = {
  x86_64: 'x86_64',
  'x86_64-v2': 'x86_64-v2',
  aarch64: 'aarch64',
  arm64: 'aarch64',
};

/**
 * Live state for one cell. `index` may be null while the ISO index is still in
 * flight, in which case only the statically-known half is filled in — the grid
 * renders its true shape immediately and gains its pulse a moment later.
 */
export function buildStatus(
  variant: Variant,
  desktopTag: string,
  index: IsoIndex | null,
): BuildStatus {
  const cell = getMatrixCell(variant, desktopTag);
  const flavor = variant.flavors.find((f) => tagSuffix(f.image) === desktopTag)
    ?? variant.flavors.find((f) => tagSuffix(f.image).startsWith(`${desktopTag}-`));

  const status: BuildStatus = {
    built: cell.available,
    image: flavor?.image ?? null,
    iso: null,
    builtAt: null,
    arches: [],
    nvidia: cell.nvidia,
    hwe: cell.hwe,
    bytes: 0,
    builds: 0,
    localOnly: variant.localBuildOnly === true,
    pending: index === null,
  };
  if (!index) return status;

  // Everything the bucket holds for this pair: the plain tag, plus its
  // arch-, version- and edition-suffixed siblings (albacore-gnome-latest,
  // albacore-gnome-10.2-x86_64-latest, albacore-gnome-nvidia-latest, …).
  const prefix = `${variant.id}-${desktopTag}`;
  const siblings = index.all.filter(
    (i) => i.name === `${prefix}-latest` || i.name.startsWith(`${prefix}-`),
  );
  if (siblings.length === 0) return status;

  const exact = flavor ? isoNameForImage(variant.id, flavor.image) : null;
  status.iso = (exact ? index.entries.get(exact) : undefined)
    ?? index.entries.get(`${prefix}-latest`)
    ?? null;

  const arches = new Set<string>();
  let newest = 0;
  status.builds = siblings.length;
  for (const s of siblings) {
    status.bytes += s.size;
    const label = ARCH_LABELS[s.arch];
    if (label) arches.add(label);
    const t = Date.parse(s.modified);
    if (Number.isFinite(t) && t > newest) newest = t;
    const tail = s.name.slice(prefix.length);
    if (tail.includes('nvidia')) status.nvidia = true;
    if (tail.includes('hwe')) status.hwe = true;
  }
  status.arches = [...arches].sort();
  status.builtAt = newest ? new Date(newest).toISOString() : null;
  return status;
}

/** Headline numbers for the matrix page, computed from the same live index. */
export type MatrixSummary = {
  variants: number;
  desktops: number;
  combinations: number;
  isos: number;
  bytes: number;
  newest: string | null;
};

export function matrixSummary(index: IsoIndex | null): MatrixSummary {
  const combinations = VARIANTS.reduce(
    (n, v) => n + ALL_DESKTOPS.filter((d) => getMatrixCell(v, d.tag).available).length,
    0,
  );
  const summary: MatrixSummary = {
    variants: VARIANTS.length,
    desktops: ALL_DESKTOPS.length,
    combinations,
    isos: 0,
    bytes: 0,
    newest: null,
  };
  if (!index) return summary;

  let newest = 0;
  for (const iso of index.all) {
    summary.isos += 1;
    summary.bytes += iso.size;
    const t = Date.parse(iso.modified);
    if (Number.isFinite(t) && t > newest) newest = t;
  }
  summary.newest = newest ? new Date(newest).toISOString() : null;
  return summary;
}

/**
 * Builds per day over a `days` window, oldest bucket first.
 *
 * The window ends at the most recent build rather than at today. A pipeline
 * that last published a week ago would otherwise render as an empty chart
 * pinned to an empty "today", hiding the shape of the run that did happen —
 * and how long ago that was is already its own stat tile.
 */
export function buildsPerDay(
  index: IsoIndex | null,
  days = 14,
): {buckets: {day: string; count: number}[]; anchor: string | null} {
  const byDay = new Map<string, number>();
  let newest = '';
  for (const iso of index?.all ?? []) {
    const day = iso.modified.slice(0, 10);
    byDay.set(day, (byDay.get(day) ?? 0) + 1);
    if (day > newest) newest = day;
  }

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const todayKey = today.toISOString().slice(0, 10);
  const anchorKey = newest && newest < todayKey ? newest : todayKey;
  const anchor = new Date(`${anchorKey}T00:00:00Z`);

  const buckets: {day: string; count: number}[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(anchor);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({day: key, count: byDay.get(key) ?? 0});
  }
  return {buckets, anchor: newest ? anchorKey : null};
}
