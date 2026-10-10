// CI browser regression for required coverage, failed collection and stale data.
// Run against the built site; no remote feed is needed for these assertions.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {AxeBuilder} from '@axe-core/playwright';

const fixture = JSON.parse(await readFile(new URL('./fixtures/build-health.json', import.meta.url), 'utf8'));
const port = 3402;
const server = spawn('npm', ['run', 'serve', '--', '--port', String(port), '--no-open'], {stdio: 'ignore'});
let browser;
try {
  let started = false;
  for (let i = 0; i < 120; i++) {
    try {if ((await fetch(`http://localhost:${port}/build-health`)).ok) {started = true; break;}} catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(started, 'built site must start');
  browser = await chromium.launch();
  const context = await browser.newContext({viewport: {width: 1280, height: 900}});
  await context.addCookies([{name: 'health-test-cookie', value: 'must-not-be-forwarded', url: `http://localhost:${port}`}]);
  const page = await context.newPage();
  let response = structuredClone(fixture);
  response.generatedAt = new Date().toISOString();
  let unavailable = false;
  let bodyOverride = null;
  await context.route('**/api/build-health', route => {
    assert.equal(route.request().headers().cookie, undefined, 'health fetch must omit visitor cookies');
    return route.fulfill({status: unavailable ? 503 : 200, contentType: 'application/json', body: bodyOverride ?? JSON.stringify(response)});
  });
  const visit = async () => {
    await page.goto(`http://localhost:${port}/build-health`);
    await page.waitForFunction(() => !document.body.innerText.includes('Loading the build health feed'));
  };
  await visit();
  const table = page.getByRole('table', {name: 'Required image and package evidence'});
  assert.equal(await table.locator('tbody tr').count(), 269);
  assert.match(await page.locator('main').innerText(), /Required targets: 269/);
  assert.match(await table.innerText(), /linux\/amd64\/v2/);
  assert.match(await table.innerText(), /armv8-a/);
  assert.match(await table.innerText(), /Hardware:/);
  assert.match(await table.innerText(), /No verified publication/);
  await page.getByLabel('Variant', {exact: true}).selectOption('albacore');
  assert.equal(await table.locator('tbody tr').count(), 36);
  await page.getByLabel('Platform', {exact: true}).selectOption('linux/amd64/v2');
  assert.equal(await table.locator('tbody tr').count(), 18);
  assert.match(await page.getByRole('status').innerText(), /Showing 18 of 269 targets/);
  await page.getByLabel('Status', {exact: true}).selectOption('healthy');
  assert.equal(await table.locator('tbody tr').count(), 0);
  assert.match(await page.locator('main').innerText(), /No targets match/);

  // An old publication must remain distinct from a failed latest attempt.
  response.targets[0].lastVerifiedPublication = {
    repository: 'ghcr.io/tuna-os/albacore', digest: `sha256:${'a'.repeat(64)}`,
    evidence: ['https://github.com/tuna-os/tunaOS/actions/runs/38038637097/attempts/1'],
  };
  await visit();
  const first = table.locator('tbody tr').first();
  assert.match(await first.innerText(), /blocked/);
  assert.match(await first.innerText(), /attempt 2/);
  assert.match(await first.innerText(), /sha256:aaaaaaaa/);
  const audit = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(audit.violations.map(value => value.id), []);

  const measured = new Date().toISOString();
  const proof = [{url: 'https://github.com/tuna-os/tunaos-packages/actions/runs/38079547859/attempts/1'}];
  const healthy = response.targets[0];
  healthy.status = 'healthy';
  healthy.reasons = [];
  healthy.measuredAt = measured;
  healthy.contractStatus = 'pass';
  healthy.latestAttempt.status = 'success';
  healthy.latestAttempt.measuredAt = measured;
  healthy.latestAttempt.imageDigest = healthy.lastVerifiedPublication.digest;
  healthy.packageReadiness = {status: 'healthy', measuredAt: measured, evidence: proof,
    factoryDigest: `sha256:${'b'.repeat(64)}`, contractDigest: `sha256:${'c'.repeat(64)}`};
  await visit();
  await page.getByLabel('Status', {exact: true}).selectOption('healthy');
  assert.equal(await table.locator('tbody tr').count(), 1);
  healthy.packageReadiness.evidence = [];
  await visit();
  assert.match(await page.getByRole('alert').innerText(), /unavailable/);
  healthy.packageReadiness.evidence = proof;
  healthy.measuredAt = new Date(Date.now() - 259200000).toISOString();
  await visit();
  await page.getByLabel('Status', {exact: true}).selectOption('healthy');
  assert.equal(await table.locator('tbody tr').count(), 0);
  await page.getByLabel('Status', {exact: true}).selectOption('stale');
  assert.equal(await table.locator('tbody tr').count(), 1);

  response.generatedAt = new Date(Date.now() - 7200000).toISOString();
  await visit();
  assert.match(await page.getByRole('alert').innerText(), /feed is stale/);
  await page.getByLabel('Status', {exact: true}).selectOption('healthy');
  assert.equal(await table.locator('tbody tr').count(), 0);
  response = {...fixture, generatedAt: new Date().toISOString(), targets: fixture.targets.slice(1)};
  await visit();
  assert.match(await page.getByRole('alert').innerText(), /unavailable/);
  assert.equal(await table.locator('tbody tr').count(), 269);
  assert.match(await table.innerText(), /Scheduling unknown/);
  bodyOverride = ' '.repeat(2 * 1024 * 1024 + 1);
  await visit();
  assert.match(await page.getByRole('alert').innerText(), /unavailable/);
  assert.equal(await table.locator('tbody tr').count(), 269);
  bodyOverride = '{invalid json';
  await visit();
  assert.match(await page.getByRole('alert').innerText(), /unavailable/);
  bodyOverride = JSON.stringify({...fixture, generatedAt: new Date().toISOString()}).replace('"schemaVersion":1', '"schemaVersion":1,"schemaVersion":1');
  await visit();
  assert.match(await page.getByRole('alert').innerText(), /unavailable/);
  assert.equal(await table.locator('tbody tr').count(), 269);
  bodyOverride = null;
  unavailable = true;
  await visit();
  assert.match(await page.getByRole('alert').innerText(), /Missing data does not mean builds are healthy/);
  assert.equal(await table.locator('tbody tr').count(), 269);
  await page.getByLabel('Status', {exact: true}).selectOption('unknown');
  assert.equal(await table.locator('tbody tr').count(), 269);
  await page.getByLabel('Status', {exact: true}).selectOption('healthy');
  assert.equal(await table.locator('tbody tr').count(), 0);
  console.log('build health browser: all 269 targets, platform filters, stale/invalid/unavailable feeds, latest versus publication and accessibility pass');
} finally {
  await browser?.close();
  server.kill();
}
