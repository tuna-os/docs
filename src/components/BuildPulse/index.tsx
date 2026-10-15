import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import {buildsPerDay, matrixSummary} from '@site/src/data/matrix';
import type {IsoIndex} from '@site/src/hooks/useIsoIndex';

import styles from './styles.module.css';

function formatBytes(bytes: number): {value: string; unit: string} {
  const tib = bytes / 1024 ** 4;
  if (tib >= 1) return {value: tib.toFixed(1), unit: 'TiB'};
  return {value: (bytes / 1024 ** 3).toFixed(0), unit: 'GiB'};
}

/** "3 hours", "2 days" — the elapsed part, without a suffix. */
export function elapsed(iso: string, now: number): string {
  const ms = now - Date.parse(iso);
  if (!Number.isFinite(ms) || ms < 0) return 'just now';
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) return `${Math.max(1, minutes)} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 48) return `${hours} h`;
  return `${Math.round(hours / 24)} d`;
}

function Tile({
  value,
  unit,
  label,
  pending,
}: {
  value: string;
  unit?: string;
  label: string;
  pending?: boolean;
}): ReactNode {
  return (
    <div className={styles.tile}>
      <span className={styles.tileValue} data-pending={pending ? '' : undefined}>
        {value}
        {unit && <span className={styles.tileUnit}>{unit}</span>}
      </span>
      <span className={styles.tileLabel}>{label}</span>
    </div>
  );
}

/**
 * Headline numbers and a fortnight of build activity, both read from the live
 * ISO index rather than written down here. The numbers that need the index
 * render as a placeholder until it lands; the ones that do not (bases,
 * desktops, combinations) are right from the first paint.
 */
export default function BuildPulse({index}: {index: IsoIndex | null}): ReactNode {
  // The index arrives client-side, and "2 h ago" is only meaningful against
  // the reader's clock — so relative times wait for mount rather than being
  // baked into the prerendered HTML.
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const summary = matrixSummary(index);
  const {buckets: days, anchor} = buildsPerDay(index, 14);
  const peak = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((n, d) => n + d.count, 0);
  const todayKey = new Date().toISOString().slice(0, 10);
  const size = formatBytes(summary.bytes);
  const loading = index === null;

  return (
    <div className={styles.pulse}>
      <div className={styles.tiles}>
        <Tile value={String(summary.variants)} label="Base images" />
        <Tile value={String(summary.desktops)} label="Desktops" />
        <Tile value={String(summary.combinations)} label="Built combinations" />
        <Tile
          value={loading ? '···' : String(summary.isos)}
          label="Live ISOs published"
          pending={loading}
        />
        <Tile
          value={loading ? '···' : size.value}
          unit={loading ? undefined : size.unit}
          label="Of installable media"
          pending={loading}
        />
        <Tile
          value={
            loading || !summary.newest || now === null ? '···' : elapsed(summary.newest, now)
          }
          label="Since the last build"
          pending={loading || !summary.newest}
        />
      </div>

      <figure className={styles.chart}>
        <figcaption className={styles.chartHead}>
          <span className={styles.chartTitle}>
            ISOs published, 14 days to {anchor && anchor !== todayKey ? anchor.slice(5) : 'today'}
          </span>
          <span className={styles.chartTotal}>
            {loading ? 'reading the index…' : `${total} in the window`}
          </span>
        </figcaption>
        <div className={styles.bars} aria-hidden>
          {days.map((d) => (
            <span key={d.day} className={styles.barSlot}>
              <span
                className={styles.bar}
                style={{height: `${Math.max(d.count ? 6 : 2, (d.count / peak) * 100)}%`}}
                data-empty={d.count === 0 ? '' : undefined}
              />
              <span className={styles.barCount}>{d.count || ''}</span>
            </span>
          ))}
        </div>
        <div className={styles.axis} aria-hidden>
          <span>{days[0]?.day.slice(5)}</span>
          <span>{days[days.length - 1]?.day.slice(5)}</span>
        </div>
        {/* The chart's table view: the same series, for anyone the bars do not serve. */}
        <table className={styles.srOnly}>
          <caption>ISOs published per day, the 14 days to {days[days.length - 1]?.day}</caption>
          <thead>
            <tr>
              <th scope="col">Day</th>
              <th scope="col">ISOs published</th>
            </tr>
          </thead>
          <tbody>
            {days.map((d) => (
              <tr key={d.day}>
                <th scope="row">{d.day}</th>
                <td>{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </figure>
    </div>
  );
}
