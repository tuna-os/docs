// Shared conventions for turning a variant + flavor into the live-ISO
// filename actually published to https://download.tunaos.org/live-isos/.
// See scripts/build-iso-index.mjs for the authoritative naming scheme.

export const ISO_BASE_URL = 'https://download.tunaos.org/live-isos';

// The live-ISO filename for a flavor is always `<variant-id>-<tag>-latest`,
// where <tag> is the part of a `ghcr.io/tuna-os/<variant>:<tag>` image ref
// after the colon.
export function isoNameForImage(variantId: string, image: string): string | null {
  const tag = image.split(':')[1];
  if (!tag) return null;
  return `${variantId}-${tag}-latest`;
}
