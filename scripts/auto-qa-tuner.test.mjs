import assert from 'node:assert/strict';
import test from 'node:test';
import {
  clamp,
  round2,
  tuneGate,
  tune,
  validateConfig,
  validateObservations,
  formatReport,
  EXIT_STEADY,
  EXIT_ATTENTION,
  EXIT_ERROR,
} from './auto-qa-tuner.mjs';

test('round2 rounds to two decimal places', () => {
  assert.equal(round2(0.12345), 0.12);
  assert.equal(round2(0.12678), 0.13);
  assert.equal(round2(0.1), 0.1);
});

test('clamp restricts numbers within bounds', () => {
  assert.equal(clamp(0.05, 0.1, 0.5), 0.1);
  assert.equal(clamp(0.6, 0.1, 0.5), 0.5);
  assert.equal(clamp(0.25, 0.1, 0.5), 0.25);
});

test('validateConfig accepts valid configuration and rejects invalid', () => {
  const valid = {
    version: 1,
    window_days: 30,
    min_sample_runs: 5,
    step: 0.05,
    gates: [
      {
        name: 'gate-a',
        workflow: 'ci.yml',
        alert_threshold: 0.2,
        min_threshold: 0.05,
        max_threshold: 0.5,
      },
    ],
  };
  assert.doesNotThrow(() => validateConfig(valid));

  assert.throws(() => validateConfig(null), /must be a JSON object/);
  assert.throws(() => validateConfig({ ...valid, step: -1 }), /must be a positive number/);
  assert.throws(() => validateConfig({ ...valid, gates: [] }), /must be a non-empty array/);
  assert.throws(
    () =>
      validateConfig({
        ...valid,
        gates: [
          { name: 'gate-a', workflow: 'ci.yml', alert_threshold: 0.6, min_threshold: 0.1, max_threshold: 0.5 },
        ],
      }),
    /require min_threshold <= alert_threshold <= max_threshold/,
  );
});

test('validateObservations validates runs and failure counts', () => {
  assert.doesNotThrow(() =>
    validateObservations({ 'gate-a': { runs: 10, failures: 1 } }, ['gate-a']),
  );
  assert.throws(
    () => validateObservations({ 'gate-a': { runs: 5, failures: 10 } }, ['gate-a']),
    /failures cannot exceed runs/,
  );
  assert.throws(
    () => validateObservations({ 'gate-a': { runs: -1, failures: 0 } }, ['gate-a']),
    /must be a non-negative integer/,
  );
});

test('tuneGate handles insufficient data, breach, tighten, and steady', () => {
  const gate = {
    name: 'test-gate',
    workflow: 'ci.yml',
    alert_threshold: 0.2,
    min_threshold: 0.05,
    max_threshold: 0.5,
  };
  const opts = { minSampleRuns: 5, step: 0.05 };

  // Insufficient data
  const res1 = tuneGate(gate, { runs: 3, failures: 0 }, opts);
  assert.equal(res1.status, 'insufficient-data');
  assert.equal(res1.proposed, 0.2);

  // Breach: rate 0.4 > threshold 0.2
  const res2 = tuneGate(gate, { runs: 10, failures: 4 }, opts);
  assert.equal(res2.status, 'breach');
  assert.equal(res2.proposed, 0.2);

  // Tighten: rate 0 failures out of 10 -> rate 0.00 -> candidate 0.05 -> proposed 0.15 (step down from 0.2)
  const res3 = tuneGate(gate, { runs: 10, failures: 0 }, opts);
  assert.equal(res3.status, 'tighten');
  assert.equal(res3.proposed, 0.15);

  // Steady: rate matches alert_threshold
  const steadyGate = { ...gate, alert_threshold: 0.1 };
  const res4 = tuneGate(steadyGate, { runs: 20, failures: 1 }, opts); // rate 0.05 + 0.05 = 0.10
  assert.equal(res4.status, 'steady');
  assert.equal(res4.proposed, 0.1);
});

test('tune evaluates entire config and generates report', () => {
  const config = {
    version: 1,
    window_days: 30,
    min_sample_runs: 5,
    step: 0.05,
    gates: [
      {
        name: 'syntax',
        workflow: 'lint.yml',
        alert_threshold: 0.2,
        min_threshold: 0.05,
        max_threshold: 0.5,
      },
      {
        name: 'build',
        workflow: 'build.yml',
        alert_threshold: 0.1,
        min_threshold: 0.02,
        max_threshold: 0.3,
      },
    ],
  };
  const observations = {
    syntax: { runs: 10, failures: 0 }, // will propose tighten
    build: { runs: 10, failures: 0 },  // rate 0 + 0.05 = 0.05 -> tighten from 0.1 to 0.05
  };
  const result = tune(config, observations);
  assert.equal(result.needsAttention, true);
  assert.equal(result.gates.length, 2);

  const report = formatReport(result, config);
  assert.match(report, /# Auto-QA tuning report/);
  assert.match(report, /syntax/);
  assert.match(report, /build/);
});
