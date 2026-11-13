// Explicit producer; --check validates freshness without writing source files.
import { mkdirSync, readFileSync, writeFileSync, readdirSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { enrichFlatpakIndex } from './flatpak-icons.mjs';

const check = process.argv.includes('--check');
const base = join(process.cwd(), 'static', 'flatpak');
const indexPath = join(base, 'index', 'static');
const iconDir = join(base, 'icons');
const input = JSON.parse(readFileSync(indexPath, 'utf8'));
// Finish the transformation before writing any artifacts.
const { index, icons, warnings, added } = enrichFlatpakIndex(input);
for (const warning of warnings) console.warn(warning);
const stale = [];
function emit(path, data) {
  try {
    if (readFileSync(path).equals(Buffer.from(data))) return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (check) stale.push(path);
  else writeFileSync(path, data);
}
if (added) emit(indexPath, `${JSON.stringify(index, null, 2)}\n`);
if (!check) mkdirSync(iconDir, { recursive: true });
for (const [name, png] of icons) emit(join(iconDir, name), png);
let existing = [];
try { existing = readdirSync(iconDir); } catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
for (const name of existing) {
  if (!name.endsWith('.png') || icons.has(name)) continue;
  if (check) stale.push(join(iconDir, name));
  else unlinkSync(join(iconDir, name));
}
if (stale.length) {
  console.error(`Stale Flatpak artifacts: ${stale.join(', ')}. Run npm run generate:flatpak.`);
  process.exitCode = 1;
} else {
  console.log(`Flatpak remote icons ${check ? 'validated' : 'generated'} (${added} AppStream entries enriched)`);
}
