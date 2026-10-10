import coverage from './build-health-required.json' with {type: 'json'};

const aliases = {'linux/amd64': 'amd64', 'linux/amd64/v2': 'amd64-v2', 'linux/arm64': 'arm64'};
export function requiredVariantPlatforms(id) {
  return [...new Set(coverage.targets.filter(row => row.target.variant === id).map(row => aliases[row.target.platform]))].sort();
}
export function architectureSummary(platforms) {
  const labels = {amd64: 'AMD64', 'amd64-v2': 'AMD64 (x86-64-v2)', arm64: 'ARM64'};
  return platforms.map(platform => labels[platform]).join(' · ');
}
