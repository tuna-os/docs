// Generate website vocabulary from the collector's matrix-derived allowlist.
import {readFileSync, writeFileSync} from 'node:fs';
if (!process.argv[2]) throw Error('Usage: node scripts/sync-adoption-categories.mjs /path/to/tunaos/services/countme/src/allowlist.json');
const rows = JSON.parse(readFileSync(process.argv[2], 'utf8'));
const values = Object.fromEntries(['variant', 'flavor', 'arch'].map(key => [key, [...new Set(rows.map(row => row[key]))].sort()]));
values.age_bucket = ['1', '2', '3', '4'];
writeFileSync(new URL('../src/data/adoption-categories.json', import.meta.url), JSON.stringify(values, null, 2) + '\n');
