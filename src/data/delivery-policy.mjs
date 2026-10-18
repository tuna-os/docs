// Reviewed copy of the upstream delivery-cutover policy
// (tuna-os/tunaOS .github/delivery-cutover.json, DeliveryPolicy v1).
//
// Source pin: tuna-os/tunaOS e69f8c900c90a7854760fceb7f3d2805fb736490
// (feat/platform-contracts-health tip). A policy update is a reviewed
// pin/copy change, never a mutable sync: bump POLICY_SOURCE, copy the
// upstream `cutover`/`retained` arrays verbatim, and keep this module pure
// (no React, no fetch) so every download surface shares one routing rule.
//
// With the EMPTY initial policy every route reproduces today's behavior:
// nothing is cut over, so all primaries stay prebuilt R2 downloads.

export const POLICY_SOURCE = {
  repository: 'tuna-os/tunaOS',
  revision: 'e69f8c900c90a7854760fceb7f3d2805fb736490',
};

// Verbatim reviewed copy of .github/delivery-cutover.json at POLICY_SOURCE.
// `cutover` lists {target {variant, flavor, platform}, evidence, preset}
// entries for qualified targets; `retained` lists R2 object basenames the
// prune sweep must keep. Both start empty — nothing qualified yet.
export const DELIVERY_POLICY = {
  schemaVersion: 1,
  kind: 'delivery-cutover',
  cutover: [],
  retained: [],
};

// Picker platform ids (what the image picker offers) and their upstream
// DeliveryPolicy platform strings plus the short ids used in
// variant-platforms.mjs / VARIANTS[].platforms.
export const PICKER_PLATFORMS = ['x86_64', 'x86_64-v2', 'aarch64'];

const UPSTREAM_OF_PICKER = {
  x86_64: 'linux/amd64',
  'x86_64-v2': 'linux/amd64/v2',
  aarch64: 'linux/arm64',
};

const PICKER_OF_UPSTREAM = {
  'linux/amd64': 'x86_64',
  'linux/amd64/v2': 'x86_64-v2',
  'linux/arm64': 'aarch64',
};

const DOCS_OF_PICKER = {
  x86_64: 'amd64',
  'x86_64-v2': 'amd64-v2',
  aarch64: 'arm64',
};

export function toUpstreamPlatform(picker) {
  return UPSTREAM_OF_PICKER[picker] ?? null;
}

export function fromUpstreamPlatform(upstream) {
  return PICKER_OF_UPSTREAM[upstream] ?? null;
}

export function toDocsPlatform(picker) {
  return DOCS_OF_PICKER[picker] ?? null;
}

// What a browser build needs. Rendered next to the primary builder action
// for cut-over targets only.
export const BUILDER_PREREQUISITES = {
  browsers: 'A current Chromium, Edge, Firefox, or Safari with WebAssembly enabled.',
  memory: 'At least 8 GiB of RAM free for the in-browser build.',
  disk: 'About 10 GiB of free disk space for the streamed ISO.',
};

export const BUILDER_URL = 'https://iso.tunaos.org';

// Builder-preset deep link carrying the full delivery target
// (variant/flavor/platform). The builder reads every option from URL
// parameters, so the link reproduces the same build for someone else.
export function getBuilderPresetUrl({variant, flavor, platform}) {
  const image = `tuna-os/${variant}:${flavor}`;
  return `${BUILDER_URL}/?image=${encodeURIComponent(image)}&platform=${encodeURIComponent(platform)}`;
}

function entryTarget(entry) {
  const t = entry && entry.target;
  if (!t || typeof t !== 'object') return null;
  return {variant: t.variant, flavor: t.flavor, platform: t.platform};
}

// True when the policy carries a cut-over entry for this exact
// {variant, flavor, platform} target. `platform` accepts either a picker id
// ('x86_64-v2') or an upstream string ('linux/amd64/v2'). Evidence
// verification stays server-side (delivery-cutover.py); the site only routes
// on the reviewed copy.
export function isCutOver(variant, flavor, platform, policy = DELIVERY_POLICY) {
  const upstream = UPSTREAM_OF_PICKER[platform] ?? platform;
  const entries = (policy && policy.cutover) || [];
  return entries.some((entry) => {
    const t = entryTarget(entry);
    return (
      t !== null &&
      t.variant === variant &&
      t.flavor === flavor &&
      (t.platform === upstream || PICKER_OF_UPSTREAM[t.platform] === platform)
    );
  });
}

// Pure delivery routing for one {variant, flavor, platform} target.
//   {kind: 'builder-preset', url, retainedUrl} — qualified: browser build is
//     primary, the retained R2 ISO (when still published) secondary.
//   {kind: 'prebuilt', url} — today's behavior: the R2 ISO is primary.
//   {kind: 'unsupported', reason} — explicit reason, never a mismatched-arch
//     download. `builderUrl` carries the generic fallback action.
export function getDeliveryRoute({variant, flavor, platform, isoUrl}, policy = DELIVERY_POLICY) {
  const picker = PICKER_OF_UPSTREAM[platform] ?? platform;
  const fallbackBuilderUrl = getBuilderPresetUrl({variant, flavor, platform: picker});
  if (isCutOver(variant, flavor, picker, policy)) {
    return {
      kind: 'builder-preset',
      url: getBuilderPresetUrl({variant, flavor, platform: picker}),
      retainedUrl: isoUrl ?? null,
      prerequisites: BUILDER_PREREQUISITES,
    };
  }
  if (isoUrl) {
    return {kind: 'prebuilt', url: isoUrl, builderUrl: fallbackBuilderUrl};
  }
  return {kind: 'unsupported', reason: 'no-prebuilt', builderUrl: fallbackBuilderUrl};
}
