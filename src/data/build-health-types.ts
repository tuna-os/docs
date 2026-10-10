import {validateBuildHealth as validate, parseBuildHealth as parse, displayStatus as status, requiredBuildTargets as targets} from './build-health.mjs';

export type HealthStatus = 'healthy' | 'running' | 'failed' | 'blocked' | 'missing' | 'stale' | 'unknown';
export type Evidence = {url: string; digest?: string; mediaType?: string};
export type Attempt = {
  identity: {repository: string; workflow: string; runId: number; runAttempt: number; sourceRevision: string; startedAt: string};
  status: 'success' | Exclude<HealthStatus, 'healthy'>;
  measuredAt: string;
  imageDigest?: string | null;
  evidence: Evidence[];
};
export type HealthRow = {
  target: {variant: string; flavor: string; platform: string; cpuBaseline: string; hardwareScope: string};
  required: boolean;
  scheduled: boolean;
  status: HealthStatus;
  reasons: string[];
  measuredAt?: string | null;
  latestAttempt: Attempt | null;
  lastVerifiedPublication: {repository: string; digest: string; evidence: string[]} | null;
  packageReadiness: {status: HealthStatus; measuredAt: string | null; evidence: Evidence[]; factoryDigest?: string | null; contractDigest?: string | null};
  contractStatus: 'pass' | 'fail' | Exclude<HealthStatus, 'healthy' | 'failed'>;
};
export type BuildHealth = {
  schemaVersion: 1;
  kind: 'build-health';
  generatedAt: string;
  sourceRevision: string;
  coverageDigest: string;
  freshnessPolicy: {buildSeconds: number; feedSeconds: number};
  collection: {status: 'available' | 'degraded' | 'failed'; sources: {id: string; repository: string; status: 'available' | 'unavailable' | 'stale' | 'unknown'; evidence: Evidence[]}[]};
  targets: HealthRow[];
};
export const requiredBuildTargets = targets as HealthRow['target'][];

export function validateBuildHealth(value: unknown, now = Date.now()): BuildHealth {
  return validate(value, now) as BuildHealth;
}
export function parseBuildHealth(text: string, now = Date.now()): BuildHealth {
  return parse(text, now) as BuildHealth;
}
export function displayStatus(row: HealthRow, feed: BuildHealth, now = Date.now()): HealthStatus {
  return status(row, feed, now) as HealthStatus;
}
export function targetKey(row: HealthRow): string {
  const t = row.target;
  return JSON.stringify([t.variant, t.flavor, t.platform, t.cpuBaseline, t.hardwareScope]);
}
