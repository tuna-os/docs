// Exercise the publish job's actual shell blocks with real local Git repos,
// OCI layouts, icon preparation and sanity checks. Only GHCR and the GitHub
// clone URL are replaced, so failure cases cannot contact production.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {chmodSync, copyFileSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
import {test} from 'node:test';
import {fileURLToPath} from 'node:url';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const workflow = readFileSync(join(repo, '.github/workflows/build-flatpaks.yml'), 'utf8');
// Read literal run blocks and working-directory values without a YAML package.
const steps = workflow.slice(workflow.indexOf('\n  publish:')).split(/(?=^      - )/m)
  .filter(step => /^        run: \|$/m.test(step))
  .map(step => ({
    cwd: step.match(/^        working-directory: (.+)$/m)?.[1] ?? '.',
    run: step.match(/^        run: \|\n((?:^          .*\n|^\n)+)/m)[1]
      .replace(/^          /gm, ''),
  }));
const realGit = spawnSync('which', ['git'], {encoding: 'utf8'}).stdout.trim();

function command(executable, args, cwd, env = process.env) {
  const result = spawnSync(executable, args, {cwd, env, encoding: 'utf8'});
  assert.ifError(result.error);
  return result;
}

function git(cwd, ...args) {
  const result = command(realGit, args, cwd);
  assert.equal(result.status, 0, result.stderr);
  return result.stdout.trim();
}

function write(path, content) {
  mkdirSync(dirname(path), {recursive: true});
  writeFileSync(path, content);
}

function labels(id) {
  // The icon preparer checks the PNG signature and IHDR dimensions.
  const png = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a', 'hex').copy(png);
  png.writeUInt32BE(128, 16);
  png.writeUInt32BE(128, 20);
  return {
    'org.flatpak.ref': `app/${id}/x86_64/stable`,
    'org.flatpak.metadata': '[Application]\n',
    'org.freedesktop.appstream.appdata': `<components><component><id>${id}</id></component></components>`,
    'org.freedesktop.appstream.icon-128': `data:image/png;base64,${png.toString('base64')}`,
  };
}

function oci(dir, imageLabels) {
  function blob(value) {
    const json = JSON.stringify(value);
    const hash = createHash('sha256').update(json).digest('hex');
    write(join(dir, 'blobs/sha256', hash), json);
    return `sha256:${hash}`;
  }
  const config = blob({architecture: 'amd64', os: 'linux', config: {Labels: imageLabels}});
  const digest = blob({config: {digest: config}});
  write(join(dir, 'index.json'), JSON.stringify({manifests: [{digest}]}));
  return digest;
}

function publish(options = {}) {
  const root = mkdtempSync(join(tmpdir(), 'flatpak-publication-'));
  try {
    const source = join(root, 'source');
    const work = join(root, 'work');
    const remote = join(root, 'remote.git');
    const bin = join(root, 'bin');
    mkdirSync(source);
    mkdirSync(work);
    mkdirSync(bin);
    for (const file of ['.github/scripts/check-flatpak-remote.py', 'scripts/prepare-flatpak-icons.mjs']) {
      mkdirSync(dirname(join(source, file)), {recursive: true});
      copyFileSync(join(repo, file), join(source, file));
    }
    const updater = '.github/scripts/update-index.py';
    mkdirSync(dirname(join(work, updater)), {recursive: true});
    copyFileSync(join(repo, updater), join(work, updater));
    const apps = ['alpha', 'beta'].map(name => ({
      name: `tuna-os/${name}`, id: `org.tunaos.${name}`, archs: options.archs ?? ['amd64'],
    }));
    write(join(source, 'static/flatpak/expected-apps.json'), JSON.stringify({apps}));
    write(join(source, 'static/flatpak/index/static'), JSON.stringify({Registry: 'https://ghcr.io', Results: []}));
    write(join(source, 'static/flatpak/tuna-os.flatpakrepo'),
      'DefaultBranch=stable\n' + (options.noAuthenticator ? '' : 'AuthenticatorName=org.flatpak.Authenticator.Oci\n'));
    const digests = new Map();
    for (const app of apps) {
      const name = app.name.split('/')[1];
      write(join(source, `static/flatpak/appstream/${app.id}.flatpakref`), `Name=${app.id}\n`);
      if (options.noArtifacts) continue;
      const imageLabels = labels(options.wrongId ? `org.unexpected.${name}` : app.id);
      if (options.noMetadata) delete imageLabels['org.flatpak.metadata'];
      if (options.noAppstream) delete imageLabels['org.freedesktop.appstream.appdata'];
      if (options.noIcon) delete imageLabels['org.freedesktop.appstream.icon-128'];
      digests.set(app.name, oci(join(work, 'artifacts', `oci-${name}`), imageLabels));
    }
    git(source, 'init', '-b', 'main');
    git(source, 'config', 'user.name', 'Flatpak test');
    git(source, 'config', 'user.email', 'flatpak-test@example.invalid');
    git(source, 'add', '.');
    git(source, 'commit', '-m', 'Initial fixture');
    git(root, 'clone', '--bare', source, remote);
    const before = git(remote, 'rev-parse', 'main');
    write(join(bin, 'git'), `#!/usr/bin/env bash
if [ "$1" = clone ]; then
  exec "$REAL_GIT" clone --branch main "$TEST_REMOTE" index-repo
fi
exec "$REAL_GIT" "$@"
`);
    write(join(bin, 'skopeo'), `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$TEST_REGISTRY_LOG"
if [ "$1" = login ]; then cat >/dev/null; fi
if [ "$1" = copy ] && [ "$TEST_FAIL_COPY" = 1 ]; then exit 1; fi
`);
    for (const name of ['git', 'skopeo']) chmodSync(join(bin, name), 0o755);
    const env = {
      ...process.env,
      PATH: `${bin}:${process.env.PATH}`,
      REAL_GIT: realGit,
      TEST_REMOTE: remote,
      TEST_REGISTRY_LOG: join(root, 'registry.log'),
      TEST_FAIL_COPY: options.failCopy ? '1' : '0',
      GITHUB_TOKEN: 'fixture-token',
      GITHUB_ACTOR: 'fixture-actor',
      FLATPAK_INDEX_TOKEN: 'fixture-token',
      REGISTRY: 'ghcr.io/tuna-os',
    };
    let result;
    for (const step of steps) {
      result = command('bash', ['--noprofile', '--norc', '-e', '-o', 'pipefail', '-c', step.run], join(work, step.cwd), env);
      if (result.status !== 0) break; // Actions skips subsequent steps on failure.
    }
    const after = git(remote, 'rev-parse', 'main');
    const candidateHead = git(join(work, 'index-repo'), 'rev-parse', 'HEAD');
    const index = JSON.parse(git(remote, 'show', 'main:static/flatpak/index/static'));
    let uploads = '';
    try { uploads = readFileSync(env.TEST_REGISTRY_LOG, 'utf8'); } catch (error) {
      if (error.code !== 'ENOENT') throw error;
    }
    const files = git(remote, 'ls-tree', '-r', '--name-only', 'main');
    return {result, before, after, candidateHead, index, uploads, digests, files};
  } finally {
    rmSync(root, {recursive: true, force: true});
  }
}

test('valid candidates publish both separate OCI layouts and the enriched index', () => {
  assert.equal(steps.length, 4, 'exercise each publication phase');
  assert.doesNotMatch(workflow, /merge-multiple: true/, 'keep each OCI layout separate');
  const {result, before, after, index, uploads, digests, files} = publish();
  assert.equal(result.status, 0, result.stderr);
  assert.notEqual(after, before);
  assert.equal(index.Results.length, 2);
  for (const entry of index.Results) {
    assert.equal(entry.Images[0].Digest, digests.get(entry.Name));
    assert.match(entry.Images[0].Labels['org.freedesktop.appstream.appdata'], /icon type="remote"/);
    const id = entry.Images[0].Labels['org.flatpak.ref'].split('/')[1];
    assert.ok(files.includes(`static/flatpak/icons/${id}-x86_64.png`));
    assert.ok(uploads.includes(`docker://ghcr.io/${entry.Name}:latest`));
  }
});

for (const [name, options, diagnostic] of [
  ['missing required architecture', {archs: ['amd64', 'arm64']}, /missing required arch/],
  ['mismatched application ID', {wrongId: true}, /don't match expected id/],
  ['missing authenticator', {noAuthenticator: true}, /missing AuthenticatorName/],
  ['missing AppStream metadata', {noAppstream: true}, /AppStream ID does not match/],
  ['missing icon metadata', {noIcon: true}, /missing Bazaar-compatible remote icon/],
  ['failed index update', {noMetadata: true}, /Missing required label/],
  ['missing OCI artifacts', {noArtifacts: true}, /index.json not found/],
]) {
  test(`${name} leaves the published branch and registry untouched`, () => {
    const {result, before, after, candidateHead, uploads} = publish(options);
    assert.notEqual(result.status, 0);
    assert.match(result.stdout + result.stderr, diagnostic);
    assert.equal(after, before);
    assert.equal(candidateHead, before, 'candidate must not be committed');
    assert.equal(uploads, '');
  });
}

test('failed registry upload prevents committing or pushing the candidate index', () => {
  const {result, before, after, candidateHead, uploads} = publish({failCopy: true});
  assert.notEqual(result.status, 0);
  assert.match(uploads, /copy oci:/);
  assert.equal(after, before);
  assert.equal(candidateHead, before, 'candidate must not be committed');
});
