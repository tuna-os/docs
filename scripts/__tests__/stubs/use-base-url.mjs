// Stub for @docusaurus/useBaseUrl, mapped by the resolve hook in
// use-iso-index.test.mjs. Behaves like a site served from the '/base'
// path prefix, and records the paths it was asked to resolve so tests
// can assert the hook asks for the right one.

export const baseUrlCalls = [];

export default function useBaseUrl(path) {
  baseUrlCalls.push(path);
  return `/base${path}`;
}

export function resetBaseUrlCalls() {
  baseUrlCalls.length = 0;
}
