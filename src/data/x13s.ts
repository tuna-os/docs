// iso.tunaos.org takes the upstream platform string. It ignores 'aarch64' and
// falls back to linux/amd64, which the X13s image does not publish.
export const X13S_BUILDER_URL =
  'https://iso.tunaos.org/?image=tuna-os%2Fbonito%3Agnome-x13s&platform=linux%2Farm64';
export const X13S_GUIDE_URL =
  'https://github.com/tuna-os/tunaOS/blob/main/docs/USER-GUIDE.md#thinkpad-x13s-preview-unverified-on-hardware';
export const X13S_REPORT_URL = 'https://github.com/tuna-os/tunaOS/issues/3368';
