import type {IsoIndex} from '@site/src/hooks/useIsoIndex';

// The object tunaOS publishes for bonito:gnome-x13s (reusable-build-artifacts.yml,
// "Upload ISO to Cloudflare R2"). Non-amd64 pointers carry an arch suffix, so
// iso-index.mjs does not mark them `latest` and the ISO list does not show it.
export const X13S_ISO_NAME = 'bonito-gnome-x13s-latest-arm64';
export const X13S_GUIDE_URL =
  'https://github.com/tuna-os/tunaOS/blob/main/docs/USER-GUIDE.md#thinkpad-x13s-preview-unverified-on-hardware';
export const X13S_REPORT_URL = 'https://github.com/tuna-os/tunaOS/issues/3368';

export function findX13sIso(index: IsoIndex | null) {
  return index?.entries.get(X13S_ISO_NAME) ?? null;
}
