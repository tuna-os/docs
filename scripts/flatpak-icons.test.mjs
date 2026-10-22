import assert from 'node:assert/strict';
import { test } from 'node:test';
import { enrichFlatpakIndex } from './flatpak-icons.mjs';

const png = Buffer.alloc(24);
Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
png.writeUInt32BE(128, 16);
png.writeUInt32BE(128, 20);
const icon = `data:image/png;base64,${png.toString('base64')}`;
const url = 'https://tunaos.org/flatpak/icons/org.example.App-x86_64.png';
function fixture(appdata = '<component><id>org.example.App</id><icon type="stock">app</icon></component>') {
  return { Results: [{ Name: 'example', Images: [{ Labels: {
    'org.flatpak.ref': 'app/org.example.App/x86_64/stable',
    'org.freedesktop.appstream.icon-128': icon,
    'org.freedesktop.appstream.appdata': appdata,
  } }] }] };
}
const labels = data => data.Results[0].Images[0].Labels;

test('enrichment returns artifacts without mutating input and is idempotent', () => {
  const input = fixture();
  const before = structuredClone(input);
  const output = enrichFlatpakIndex(input);
  assert.deepEqual(input, before);
  assert.equal(output.added, 1);
  assert.deepEqual(output.icons.get('org.example.App-x86_64.png'), png);
  assert.ok(labels(output.index)['org.freedesktop.appstream.appdata'].includes(`${url}</icon>\n    <icon type="stock">`));
  const repeated = enrichFlatpakIndex(output.index);
  assert.deepEqual(repeated.index, output.index);
  assert.deepEqual(repeated.icons, output.icons);
  assert.equal(repeated.added, 0);
});

test('inserts an icon when no stock icon exists', () => {
  const output = enrichFlatpakIndex(fixture('<component><id>org.example.App</id></component>'));
  assert.ok(labels(output.index)['org.freedesktop.appstream.appdata'].includes(url));
});

test('rejects malformed and unsafe refs', () => {
  for (const ref of ['', 'runtime/org.example.App/x86_64/stable', 'app/../../stable', 'app/id/arch/branch/extra']) {
    const input = fixture();
    labels(input)['org.flatpak.ref'] = ref;
    assert.throws(() => enrichFlatpakIndex(input), /Invalid Flatpak ref/);
  }
});

test('skips missing, malformed, truncated, and wrong-sized PNG labels', () => {
  const wrongSize = Buffer.from(png);
  wrongSize.writeUInt32BE(64, 20);
  for (const value of [undefined, '', 'data:image/jpeg;base64,AA==', 'data:image/png;base64,!!!',
    `data:image/png;base64,${Buffer.alloc(24).toString('base64')}`,
    `data:image/png;base64,${wrongSize.toString('base64')}`]) {
    const input = fixture();
    labels(input)['org.freedesktop.appstream.icon-128'] = value;
    const output = enrichFlatpakIndex(input);
    assert.deepEqual(output.index, input);
    assert.equal(output.icons.size, 0);
    assert.equal(output.warnings.length, 1);
  }
});

test('rejects mismatched IDs and invalid AppStream catalogues', () => {
  for (const xml of ['<component><id>another.App</id></component>', '<id>org.example.App</id>']) {
    assert.throws(() => enrichFlatpakIndex(fixture(xml)), /AppStream/);
  }
});

test('check mode fails stale artifacts without writing; generation converges', async () => {
  const { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, readdirSync } = await import('node:fs');
  const { tmpdir } = await import('node:os');
  const { join } = await import('node:path');
  const { spawnSync } = await import('node:child_process');
  const root = mkdtempSync(join(tmpdir(), 'flatpak-icons-'));
  try {
    const base = join(root, 'static', 'flatpak');
    mkdirSync(join(base, 'index'), { recursive: true });
    mkdirSync(join(base, 'icons'));
    const path = join(base, 'index', 'static');
    const original = JSON.stringify(fixture());
    writeFileSync(path, original);
    writeFileSync(join(base, 'icons', 'obsolete.png'), png);
    const run = (...args) => spawnSync(process.execPath,
      [new URL('./prepare-flatpak-icons.mjs', import.meta.url).pathname, ...args], { cwd: root, encoding: 'utf8' });
    assert.equal(run('--check').status, 1);
    assert.equal(readFileSync(path, 'utf8'), original);
    assert.deepEqual(readdirSync(join(base, 'icons')), ['obsolete.png']);
    assert.equal(run().status, 0);
    const generated = readFileSync(path, 'utf8');
    assert.equal(run('--check').status, 0);
    assert.equal(readFileSync(path, 'utf8'), generated);
    assert.deepEqual(readdirSync(join(base, 'icons')), ['org.example.App-x86_64.png']);
    assert.equal(run().status, 0);
    assert.equal(readFileSync(path, 'utf8'), generated);
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
