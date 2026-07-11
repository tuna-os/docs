// Derives the variant x desktop build matrix purely from VARIANTS[].flavors —
// the same data that already drives each variant's landing page — so the
// matrix can never drift out of sync with what those pages claim.
import {ALL_DESKTOPS, VARIANTS} from './variants';
import type {Variant} from './variants';

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
