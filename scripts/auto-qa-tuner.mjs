#!/usr/bin/env node
/**
 * Auto-QA tuner (ACMM criterion acmm:auto-qa-tuning).
 *
 * Evaluates observed workflow/gate outcomes against target failure rates in
 * .github/auto-qa-tuning.json and proposes adjusted alert thresholds.
 *
 * Usage:
 *   node scripts/auto-qa-tuner.mjs --config .github/auto-qa-tuning.json --observations observations.json [--apply] [--report report.md]
 *
 * Observations JSON shape:
 *   {
 *     "<gate-name>": { "runs": number, "failures": number }
 *   }
 *
 * Exit codes:
 *   0 = steady (no tuning change proposed or required)
 *   1 = attention needed (a breach or proposed threshold tightening)
 *   2 = usage / input error
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

export const EXIT_STEADY = 0;
export const EXIT_ATTENTION = 1;
export const EXIT_ERROR = 2;

export function round2(x) {
  return Math.round(x * 100) / 100;
}

export function clamp(x, lo, hi) {
  return Math.min(hi, Math.max(lo, x));
}

export function validateConfig(config) {
  if (typeof config !== 'object' || config === null || Array.isArray(config)) {
    throw new Error('config must be a JSON object');
  }
  for (const key of ['window_days', 'min_sample_runs', 'step']) {
    if (typeof config[key] !== 'number' || !(config[key] > 0)) {
      throw new Error(`config.${key} must be a positive number`);
    }
  }
  if (!Array.isArray(config.gates) || config.gates.length === 0) {
    throw new Error('config.gates must be a non-empty array');
  }
  const names = new Set();
  for (const [i, gate] of config.gates.entries()) {
    for (const key of ['name', 'workflow']) {
      if (typeof gate[key] !== 'string' || gate[key].length === 0) {
        throw new Error(`config.gates[${i}].${key} must be a non-empty string`);
      }
    }
    if (names.has(gate.name)) {
      throw new Error(`duplicate gate name: ${gate.name}`);
    }
    names.add(gate.name);
    for (const key of ['alert_threshold', 'min_threshold', 'max_threshold']) {
      if (typeof gate[key] !== 'number' || gate[key] < 0 || gate[key] > 1) {
        throw new Error(`gates[${gate.name}].${key} must be a number in [0, 1]`);
      }
    }
    if (!(gate.min_threshold <= gate.alert_threshold && gate.alert_threshold <= gate.max_threshold)) {
      throw new Error(
        `gates[${gate.name}]: require min_threshold <= alert_threshold <= max_threshold`,
      );
    }
  }
}

export function validateObservations(observations, gateNames) {
  if (typeof observations !== 'object' || observations === null || Array.isArray(observations)) {
    throw new Error('observations must be a JSON object');
  }
  const known = new Set(gateNames);
  for (const [name, obs] of Object.entries(observations)) {
    if (!known.has(name)) {
      continue;
    }
    if (typeof obs !== 'object' || obs === null) {
      throw new Error(`observations[${name}] must be an object`);
    }
    for (const key of ['runs', 'failures']) {
      if (!Number.isInteger(obs[key]) || obs[key] < 0) {
        throw new Error(`observations[${name}].${key} must be a non-negative integer`);
      }
    }
    if (obs.failures > obs.runs) {
      throw new Error(`observations[${name}]: failures cannot exceed runs`);
    }
  }
}

/**
 * Tune a single gate. Returns { name, runs, failures, rate, threshold, proposed, status }
 * where status is one of 'tighten', 'steady', 'breach', or 'insufficient-data'.
 */
export function tuneGate(gate, observed, { minSampleRuns, step }) {
  const runs = observed?.runs ?? 0;
  const failures = observed?.failures ?? 0;
  const rate = runs > 0 ? round2(failures / runs) : 0;
  const base = { name: gate.name, runs, failures, rate, threshold: gate.alert_threshold };

  if (runs < minSampleRuns) {
    return { ...base, proposed: gate.alert_threshold, status: 'insufficient-data' };
  }
  if (rate > gate.alert_threshold) {
    return { ...base, proposed: gate.alert_threshold, status: 'breach' };
  }

  // Drift toward observed failure rate + one step of headroom, never below min_threshold,
  // never leaping by more than step.
  const candidate = clamp(round2(rate + step), gate.min_threshold, gate.max_threshold);
  const proposed = clamp(
    round2(Math.max(candidate, gate.alert_threshold - step)),
    gate.min_threshold,
    gate.max_threshold,
  );

  if (proposed < gate.alert_threshold) {
    return { ...base, proposed, status: 'tighten' };
  }
  return { ...base, proposed: gate.alert_threshold, status: 'steady' };
}

/** Tune every gate in `config` against `observations`. */
export function tune(config, observations) {
  validateConfig(config);
  validateObservations(observations, config.gates.map((g) => g.name));
  const gates = config.gates.map((gate) =>
    tuneGate(gate, observations[gate.name], {
      minSampleRuns: config.min_sample_runs,
      step: config.step,
    }),
  );
  const needsAttention = gates.some((g) => g.status === 'breach' || g.status === 'tighten');
  return { gates, needsAttention };
}

export function formatReport(result, config) {
  const lines = [
    `# Auto-QA tuning report (window: last ${config.window_days} days)`,
    '',
    '| gate | runs | failures | failure rate | threshold | proposed | status |',
    '| --- | ---: | ---: | ---: | ---: | ---: | --- |',
  ];
  for (const g of result.gates) {
    lines.push(
      `| ${g.name} | ${g.runs} | ${g.failures} | ${g.rate.toFixed(2)} | ${g.threshold.toFixed(2)} | ${g.proposed.toFixed(2)} | ${g.status} |`,
    );
  }
  lines.push('');
  const breaches = result.gates.filter((g) => g.status === 'breach').map((g) => g.name);
  const tightens = result.gates.filter((g) => g.status === 'tighten').map((g) => g.name);
  if (breaches.length > 0) {
    lines.push(`Breached gates (investigate, threshold held): ${breaches.join(', ')}.`);
  }
  if (tightens.length > 0) {
    lines.push(
      `Proposed tightening (apply with \`--apply\` after review): ${tightens.join(', ')}.`,
    );
  }
  if (!result.needsAttention) {
    lines.push('All gates steady — no tuning change proposed.');
  }
  lines.push('');
  return lines.join('\n');
}

export function loadJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (err) {
    throw new Error(`cannot read JSON from ${path}: ${err.message}`);
  }
}

export function parseArgs(argv) {
  const args = { config: null, observations: null, apply: false, report: null };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--apply') {
      args.apply = true;
    } else if ((arg === '--config' || arg === '--observations' || arg === '--report') && i + 1 < argv.length) {
      args[arg.slice(2)] = argv[++i];
    } else {
      throw new Error(`unknown argument: ${arg}`);
    }
  }
  if (!args.config || !args.observations) {
    throw new Error(
      'usage: auto-qa-tuner.mjs --config <file> --observations <file> [--apply] [--report <file>]',
    );
  }
  return args;
}

function main(argv) {
  let args;
  try {
    args = parseArgs(argv);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
  let config;
  let observations;
  try {
    config = loadJson(args.config);
    observations = loadJson(args.observations);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
  let result;
  try {
    result = tune(config, observations);
  } catch (err) {
    console.error(`error: ${err.message}`);
    process.exit(EXIT_ERROR);
  }
  const report = formatReport(result, config);
  process.stdout.write(report);
  if (args.report) {
    writeFileSync(args.report, report);
  }
  if (args.apply) {
    for (const g of result.gates) {
      const gate = config.gates.find((c) => c.name === g.name);
      gate.alert_threshold = g.proposed;
    }
    writeFileSync(args.config, `${JSON.stringify(config, null, 2)}\n`);
    const changed = result.gates.filter((g) => g.proposed !== g.threshold);
    for (const g of changed) {
      console.log(`updated ${g.name}: ${g.threshold.toFixed(2)} -> ${g.proposed.toFixed(2)}`);
    }
  }
  process.exit(result.needsAttention ? EXIT_ATTENTION : EXIT_STEADY);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
