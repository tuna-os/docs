import {useEffect, useState, type ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import useBaseUrl from '@docusaurus/useBaseUrl';
import useBuildHealth from '../hooks/useBuildHealth';
import {displayStatus, targetKey, requiredBuildTargets, type Evidence, type HealthRow} from '../data/build-health-types';
import styles from './build-health.module.css';

// This is declared coverage, with no manufactured observation or publication.
const unobserved: HealthRow[] = requiredBuildTargets.map(target => ({target,
  required: true, scheduled: false, status: 'unknown', reasons: ['No feed observation'],
  latestAttempt: null, lastVerifiedPublication: null, measuredAt: null,
  packageReadiness: {status: 'unknown', measuredAt: null, evidence: []}, contractStatus: 'unknown'}));

function Timestamp({value}: {value?: string | null}): ReactNode {
  return value ? <time dateTime={value}>{value}</time> : <>No measurement</>;
}
function EvidenceLinks({evidence}: {evidence: Evidence[]}): ReactNode {
  return evidence.length ? <ul>{evidence.map((e, i) => <li key={`${e.url}:${i}`}><a href={e.url} rel="noopener noreferrer">Evidence {i + 1}</a>{e.digest && <code>{e.digest}</code>}</li>)}</ul> : <>No evidence</>;
}
function AttemptCell({row}: {row: HealthRow}): ReactNode {
  const attempt = row.latestAttempt;
  return attempt ? <>
    <strong>{attempt.status}</strong><br />Run {attempt.identity.runId}, attempt {attempt.identity.runAttempt}<br />
    Started: <Timestamp value={attempt.identity.startedAt} /><br />
    Observed: <Timestamp value={attempt.measuredAt} /><br />
    Source: <code>{attempt.identity.sourceRevision}</code>
    <EvidenceLinks evidence={attempt.evidence} />
  </> : <>No attempt recorded</>;
}

export default function BuildHealthPage(): ReactNode {
  const state = useBuildHealth();
  const feedUrl = useBaseUrl('/api/build-health');
  const [now, setNow] = useState<number>(0);
  const [variant, setVariant] = useState('all');
  const [platform, setPlatform] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  useEffect(() => {setNow(Date.now()); const timer = setInterval(() => setNow(Date.now()), 30000); return () => clearInterval(timer);}, []);
  const feed = state.feed;
  const rows = feed?.targets ?? unobserved;
  const rowStatus = (row: HealthRow) => feed ? displayStatus(row, feed, now) : 'unknown';
  const statuses = ['healthy', 'running', 'failed', 'blocked', 'missing', 'stale', 'unknown'];
  const visible = rows.filter(row => (variant === 'all' || row.target.variant === variant) && (platform === 'all' || row.target.platform === platform) && (filterStatus === 'all' || rowStatus(row) === filterStatus));
  const stale = feed && now > Date.parse(feed.generatedAt) + feed.freshnessPolicy.feedSeconds * 1000;
  return <Layout title="Build health" description="Evidence for every required TunaOS image and its package supply.">
    <main className={`container margin-vert--lg ${styles.main}`}>
      <Heading as="h1">Build health</Heading>
      <p>Every required image appears here, including targets with no build or package evidence. The latest attempt and the last verified publication have separate records.</p>
      <p><a href={feedUrl}>Build health JSON feed</a></p>
      {state.status === 'loading' && <p role="status">Loading the build health feed…</p>}
      {state.status === 'unavailable' && <div role="alert"><strong>Build health unavailable</strong><p>{state.error} Missing data does not mean builds are healthy.</p></div>}
      {feed && <>
        <p>Feed generated: <Timestamp value={feed.generatedAt} />. Source: <code>{feed.sourceRevision}</code></p>
        <p>Required targets: <strong>{rows.filter(row => row.required).length}</strong>. Scheduled targets: {rows.filter(row => row.scheduled).length}. Collection: <strong>{feed.collection.status}</strong>.</p>
        {stale && <p role="alert">The build health feed is stale. Its observations do not establish current health.</p>}
        {feed.collection.status !== 'available' && <p role="alert">Collection is {feed.collection.status}. Some source observations are unavailable.</p>}
        <details><summary>Collection sources and evidence</summary><ul>{feed.collection.sources.map(source => <li key={source.id}>{source.id}: {source.status} ({source.repository}) <EvidenceLinks evidence={source.evidence} /></li>)}</ul></details>
        <p>Image checks expire after {feed.freshnessPolicy.buildSeconds / 3600} hours. Feed observations expire after {feed.freshnessPolicy.feedSeconds / 3600} hours.</p>
      </>}
      {!feed && <p>Required targets: <strong>{requiredBuildTargets.length}</strong>. Scheduling and build observations are unknown until a valid feed arrives.</p>}
      <fieldset className={styles.filters}><legend>Filter required targets</legend>
          <div><label htmlFor="health-variant">Variant</label><select id="health-variant" value={variant} onChange={e => setVariant(e.target.value)}><option value="all">All variants</option>{[...new Set(rows.map(r => r.target.variant))].sort().map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label htmlFor="health-platform">Platform</label><select id="health-platform" value={platform} onChange={e => setPlatform(e.target.value)}><option value="all">All platforms</option>{[...new Set(rows.map(r => r.target.platform))].sort().map(v => <option key={v}>{v}</option>)}</select></div>
          <div><label htmlFor="health-status">Status</label><select id="health-status" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}><option value="all">All statuses</option>{statuses.map(v => <option key={v}>{v}</option>)}</select></div>
        </fieldset>
        <p role="status">Showing {visible.length} of {rows.length} targets. Filters do not change required coverage.</p>
        <div className={styles.scroll} tabIndex={0} role="region" aria-label="Build health table">
          <table className={styles.table}><caption>Required image and package evidence</caption><thead><tr>{['Target', 'Current status', 'Latest attempt', 'Package supply and image contract', 'Last verified publication'].map(label => <th key={label} scope="col">{label}</th>)}</tr></thead><tbody>
            {visible.map(row => <tr key={targetKey(row)}>
              <th scope="row">{row.target.variant} / {row.target.flavor}<br />{row.target.platform}<br />ISA: {row.target.cpuBaseline}<br />Hardware: {row.target.hardwareScope}<br />{!feed ? 'Scheduling unknown' : row.scheduled ? 'Scheduled' : 'Required; not scheduled'}</th>
              <td><strong>{rowStatus(row)}</strong><br />Measured: <Timestamp value={row.measuredAt} />{row.reasons.length > 0 && <ul>{row.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>}</td>
              <td><AttemptCell row={row} /></td>
              <td>Packages: <strong>{row.packageReadiness.status}</strong><br />Image contract: {row.contractStatus}<br /><Timestamp value={row.packageReadiness.measuredAt} /><EvidenceLinks evidence={row.packageReadiness.evidence} />{row.packageReadiness.factoryDigest && <code>{row.packageReadiness.factoryDigest}</code>}{row.packageReadiness.contractDigest && <code>{row.packageReadiness.contractDigest}</code>}</td>
              <td>{row.lastVerifiedPublication ? <>{row.lastVerifiedPublication.repository}<br /><code>{row.lastVerifiedPublication.digest}</code><EvidenceLinks evidence={row.lastVerifiedPublication.evidence.map(url => ({url}))} /></> : 'No verified publication'}</td>
            </tr>)}
          </tbody></table>
        </div>
        {visible.length === 0 && <p>No targets match these filters.</p>}
    </main>
  </Layout>;
}
