#!/usr/bin/env node
// Accessibility audit — runs axe-core (WCAG 2.0/2.1/2.2 A + AA) over the
// built site and fails on any violation. See DESIGN.md § Accessibility.
//
//   npm run build && npm run a11y
//
// The pages below are the ones people land on: the front page, each primary
// call to action from DESIGN.md, and one of each generated template (a
// variant landing, a project landing, a docs page). Pass paths as arguments
// to check something else.

import {spawn} from 'node:child_process';
import process from 'node:process';
import {chromium} from 'playwright';
import {AxeBuilder} from '@axe-core/playwright';

const PORT = Number(process.env.A11Y_PORT ?? 3399);
const BASE = `http://localhost:${PORT}`;

const DEFAULT_PATHS = [
  '/',
  '/download',
  '/iso-builder',
  '/wootc',
  '/flatpak',
  '/office',
  '/variants',
  '/matrix',
  '/projects',
  '/support',
  '/albacore',
  '/tacklebox',
  '/docs/intro',
];

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

const paths = process.argv.slice(2).length ? process.argv.slice(2) : DEFAULT_PATHS;

async function serve() {
  const child = spawn(
    'npx',
    ['docusaurus', 'serve', '--port', String(PORT), '--no-open'],
    {stdio: 'ignore'},
  );
  // Poll rather than parse the server's banner: the banner text changes
  // between Docusaurus releases, and a missed match hangs the whole run.
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(`${BASE}/`, {signal: AbortSignal.timeout(2000)});
      if (res.ok) return child;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  child.kill();
  throw new Error('server did not start');
}

const server = await serve();
const browser = await chromium.launch(
  process.env.PLAYWRIGHT_CHROMIUM ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM} : {},
);
// axe-core/playwright requires a context-owned page.
const context = await browser.newContext({viewport: {width: 1280, height: 900}});
const page = await context.newPage();

let total = 0;
for (const path of paths) {
  // Some pages keep a carousel timer running, so networkidle never settles.
  await page.goto(BASE + path, {waitUntil: 'load'});
  await page.waitForTimeout(700);
  const {violations} = await new AxeBuilder({page}).withTags(TAGS).analyze();
  const count = violations.reduce((n, v) => n + v.nodes.length, 0);
  total += count;
  console.log(`${count === 0 ? 'ok  ' : 'FAIL'} ${path}${count ? ` — ${count} node(s)` : ''}`);
  for (const v of violations) {
    console.log(`     ${v.id} (${v.impact}): ${v.help}`);
    for (const node of v.nodes.slice(0, 5)) {
      console.log(`       ${node.target.join(' ')}`);
      const detail = [...node.any, ...node.all, ...node.none][0]?.message;
      if (detail) console.log(`         ${detail}`);
    }
  }
}

await browser.close();
server.kill();

console.log(`\n${total} violation node(s) across ${paths.length} page(s)`);
process.exit(total === 0 ? 0 : 1);
