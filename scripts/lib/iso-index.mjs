// Pure transformation logic for building the structured ISO index
// from rclone lsjson entries.
//
// This module contains no process I/O or stream side effects so callers
// and unit tests can consume it directly without touching stdin.

export const BASE_URL = 'https://download.tunaos.org';

// Friendly metadata per top-level prefix. Anything not listed falls back
// to a title-cased prefix and the lowest sort priority.
export const CATEGORIES = {
  'live-isos': {
    label: 'TunaOS Desktop',
    blurb: 'Cloud-native Enterprise Linux desktops — the main TunaOS lineup.',
    icon: '🐟',
    order: 0,
  },
  dakota: {
    label: 'Dakota',
    blurb: 'Project Bluefin Dakota live ISO — offline install via tuna-installer.',
    icon: '🎣',
    order: 1,
  },
  'dakota-x13s': {
    label: 'Dakota — ThinkPad X13s',
    blurb: 'Dakota for the Lenovo ThinkPad X13s (Qualcomm SC8280XP, aarch64).',
    icon: '💪',
    order: 2,
  },
  'bonito-x13s': {
    label: 'Bonito — ThinkPad X13s',
    blurb: 'Bonito bootc image + live ISO for the ThinkPad X13s (aarch64).',
    icon: '💪',
    order: 3,
  },
  tromso: {
    label: 'Tromsø',
    blurb: 'Aurora KDE Plasma 6 — built from source on freedesktop-sdk with BuildStream.',
    icon: '🌌',
    order: 4,
  },
  'xfce-linux': {
    label: 'XFCE Linux',
    blurb: 'Lightweight XFCE Wayland desktop — built from source on freedesktop-sdk.',
    icon: '🖥️',
    order: 5,
  },
};

export function titleCase(s) {
  return s.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Heuristic arch tag from a filename, "" if none detected.
export function detectArch(name) {
  const n = name.toLowerCase();
  if (/(aarch64|arm64|x13s)/.test(n)) return 'aarch64';
  if (/x86_64_v2|amd64-v2/.test(n)) return 'x86_64-v2';
  if (/(x86_64|amd64)/.test(n)) return 'x86_64';
  return '';
}

// Builds the iso-index structure from raw parsed rclone entries.
export function buildIsoIndex(entries = [], options = {}) {
  const baseUrl = options.baseUrl || BASE_URL;
  const categoriesConfig = options.categories || CATEGORIES;
  const now = options.generatedAt || new Date().toISOString();

  const isos = [];
  const checksums = {}; // category -> checksum object url

  for (const e of entries) {
    // rclone lsjson gives Path (relative to the remote root), Name, Size, ModTime.
    const path = e.Path || e.Name;
    if (!path) continue;
    const slash = path.indexOf('/');
    const prefix = slash === -1 ? '' : path.slice(0, slash);
    const base = e.Name || path.slice(slash + 1);

    if (/SHA256SUMS/i.test(base)) {
      // Track the newest checksum manifest per category.
      const prev = checksums[prefix];
      if (!prev || (e.ModTime || '') > prev.modified) {
        checksums[prefix] = {url: `${baseUrl}/${path}`, modified: e.ModTime || ''};
      }
      continue;
    }
    if (!base.toLowerCase().endsWith('.iso')) continue;

    isos.push({
      category: prefix || 'other',
      name: base.replace(/\.iso$/i, ''),
      path,
      url: `${baseUrl}/${path}`,
      size: e.Size ?? null,
      modified: e.ModTime || '',
      arch: detectArch(base),
      latest: /-latest\.iso$/i.test(base),
    });
  }

  // Group into categories.
  const byCat = new Map();
  for (const iso of isos) {
    if (!byCat.has(iso.category)) byCat.set(iso.category, []);
    byCat.get(iso.category).push(iso);
  }

  const categories = [...byCat.entries()].map(([id, items]) => {
    const meta = categoriesConfig[id] || {label: titleCase(id), blurb: '', icon: '📀', order: 99};
    // Latest builds first, then newest-modified dated archives.
    items.sort((a, b) => {
      if (a.latest !== b.latest) return a.latest ? -1 : 1;
      return (b.modified || '').localeCompare(a.modified || '');
    });
    return {
      id,
      label: meta.label,
      blurb: meta.blurb,
      icon: meta.icon,
      order: meta.order,
      checksums: checksums[id]?.url || null,
      isos: items,
    };
  });
  categories.sort((a, b) => a.order - b.order || a.label.localeCompare(b.label));

  return {
    generatedAt: now,
    baseUrl,
    count: isos.length,
    categories,
  };
}
