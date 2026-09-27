// Run after npm run build. Browser assertions exercise the actual built page.
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {AxeBuilder} from '@axe-core/playwright';
const port = 3401;
const server = spawn('npm', ['run', 'serve', '--', '--port', String(port), '--no-open'], {stdio: 'ignore'});
let browser;
try {
  for (let i=0; i<120; i++) {
    try {if ((await fetch(`http://localhost:${port}/metrics`)).ok) break;} catch {}
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  let response = {schema: 1, methodology: 'tunaos-countme-v1', generated_at: new Date().toISOString(), collection_started: null, weeks: []};
  let unavailable = false;
  await context.route('**/api/adoption', route => route.fulfill({status: unavailable ? 503 : 200, contentType: 'application/json', body: JSON.stringify(response)}));
  const visit = async () => {await page.goto(`http://localhost:${port}/metrics`); await page.waitForFunction(() => !document.body.innerText.includes('Loading the public metrics feed'));};
  await visit(); assert.match(await page.locator('main').innerText(), /Collection has not started/);
  assert.match(await page.locator('main').innerText(), /Reporting is enabled by default/);
  assert.match(await page.locator('main').innerText(), /opt-out persists across image updates/);
  assert.match(await page.locator('main').innerText(), /Age starts at the first eligible attempt, not the installation date/);
  assert.match(await page.locator('main').innerText(), /A failed request also starts this clock/);
  assert.match(await page.locator('main').innerText(), /at most one reporting attempt per UTC week/);
  assert.match(await page.locator('main').innerText(), /Cloudflare may add transport headers; the collector does not read or store them/);
  const current = new Date(); current.setUTCHours(0, 0, 0, 0);
  current.setUTCDate(current.getUTCDate() - (current.getUTCDay() + 6) % 7);
  const end = current.toISOString().slice(0, 10);
  const start = new Date(current.getTime() - 604800000).toISOString().slice(0, 10);
  response = {...response, collection_started: `${start}T00:00:00Z`, weeks: [{week_start: start, week_end: end, status: 'degraded', total: {status: 'reported', count: 20}, dimensions: {variant: {status: 'reported', counts: {yellowfin: 20}}, flavor: {status: 'suppressed', counts: null}, arch: {status: 'reported', counts: {x86_64: 20}}, age_bucket: {status: 'reported', counts: {'2': 20}}}}]};
  await visit();
  assert.match(await page.locator('main').innerText(), /20–29/);
  assert.equal(await page.getByRole('heading', {name: 'Age since first attempt'}).count(), 1);
  assert.match(await page.locator('main').innerText(), /whole category is suppressed/);
  assert.match(await page.locator('main').innerText(), /Collection was degraded/);
  assert.equal(await page.locator('#metrics-week option').count(), 1);
  const audit = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  assert.deepEqual(audit.violations.map(value => value.id), []);
  await page.screenshot({path: '/tmp/tunaos-metrics-populated.png', fullPage: true});
  const good = structuredClone(response);
  response = {...good, weeks: []}; await visit();
  assert.match(await page.locator('main').innerText(), /latest closed UTC week is missing/);
  response = {...good, generated_at: new Date(Date.now() - 172800000).toISOString()}; await visit();
  assert.match(await page.locator('main').innerText(), /more than 24 hours old/);
  response = {...good, weeks: [{...good.weeks[0], status: 'complete', total: {status: 'reported', count: 0}, dimensions: Object.fromEntries(['variant', 'flavor', 'arch', 'age_bucket'].map(key => [key, {status: 'reported', counts: {}}]))}]};
  await visit();
  const weekly = await page.getByRole('table', {name: 'Weekly reporting installation estimates'}).innerText();
  assert.match(weekly, /\b0\b/); assert.doesNotMatch(weekly, /0–9/);
  assert.equal(await page.locator('div[title$=": 0"] > div').evaluate(element => element.style.height), '0%');
  assert.doesNotMatch(await page.locator('main').innerText(), /latest closed UTC week is missing|more than 24 hours old/);
  await page.goto(`http://localhost:${port}/docs/adoption-metrics`);
  assert.match(await page.locator('main').innerText(), /Countme for distribution repositories has separate controls/);
  const [jsonPage] = await Promise.all([page.waitForEvent('popup'), page.getByRole('link', {name: 'public JSON feed', exact: true}).click()]);
  await jsonPage.waitForLoadState();
  assert.match(await jsonPage.locator('body').innerText(), /\"schema\":\s*1/);
  await jsonPage.close();
  unavailable = true; await visit(); assert.match(await page.locator('main').innerText(), /Missing data is not zero adoption/);
  await page.screenshot({path: '/tmp/tunaos-metrics-dashboard.png', fullPage: true});
  console.log('metrics browser: missing, reported, suppressed, degraded, unavailable, stale/missing publication, true zero, native-doc JSON link and axe pass');
} finally {await browser?.close(); server.kill();}
