import {useEffect, useState, type ReactNode} from 'react';
import Heading from '@theme/Heading';
import {parseFactoryHealth, sweepAge} from '@site/src/data/factory-health.mjs';
import styles from './styles.module.css';

const PROVENANCE_URL = 'https://raw.githubusercontent.com/tuna-os/tunaOS/main/docs/matrix-provenance.json';
const PROVENANCE_PAGE = 'https://github.com/tuna-os/tunaOS/blob/main/docs/matrix-provenance.json';

type Tally = {tested: number; total: number};
type FactoryHealthSummary = {
  factory_health: {green: number; total: number};
  install: Tally;
  lifecycle: Tally;
  never_tested: number;
  known_regressions: {blocking: number; advisory: number};
  last_full_sweep: string;
};

type HealthState =
  | {status: 'loading'; summary: null}
  | {status: 'available'; summary: FactoryHealthSummary}
  | {status: 'unavailable'; summary: null};

export default function FactoryHealth(): ReactNode {
  const [state, setState] = useState<HealthState>({status: 'loading', summary: null});

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let active = true;

    (async () => {
      try {
        const response = await fetch(PROVENANCE_URL, {
          cache: 'no-cache',
          credentials: 'omit',
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const summary = parseFactoryHealth(await response.text()) as FactoryHealthSummary | null;
        if (!summary) throw new Error('Invalid factory health data');
        if (active) setState({status: 'available', summary});
      } catch {
        if (active) setState({status: 'unavailable', summary: null});
      } finally {
        clearTimeout(timeout);
      }
    })();

    return () => {
      active = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return (
    <section className={styles.health} aria-labelledby="factory-health-title">
      <div className={styles.heading}>
        <Heading as="h2" id="factory-health-title">Factory health</Heading>
        <a href={PROVENANCE_PAGE}>Source data</a>
      </div>
      {state.status === 'loading' && <p role="status">Loading factory health…</p>}
      {state.status === 'unavailable' && (
        <p role="alert">
          Factory health is unavailable. Missing data does not mean that an image is healthy.
        </p>
      )}
      {state.status === 'available' && (
        <div className={styles.summary}>
          <p><strong>Factory health: {state.summary.factory_health.green}/{state.summary.factory_health.total} cells green</strong></p>
          <p>Install-tested: {state.summary.install.tested}/{state.summary.install.total} · Lifecycle-tested: {state.summary.lifecycle.tested}/{state.summary.lifecycle.total} · Never tested: {state.summary.never_tested}</p>
          <p>Known regressions: {state.summary.known_regressions.blocking} blocking, {state.summary.known_regressions.advisory} advisory</p>
          <p>Last full sweep: {sweepAge(state.summary.last_full_sweep)} ({state.summary.last_full_sweep})</p>
        </div>
      )}
    </section>
  );
}
