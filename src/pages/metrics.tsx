import {useEffect, useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import {validateAdoption, estimateText, adoptionWarnings} from '../data/adoption.mjs';
import page from '../css/page.module.css';
import styles from './metrics.module.css';

type Margin = {status: 'reported'|'suppressed'|'unavailable'; counts: Record<string, number>|null};
type Week = {week_start: string; week_end: string; status: string; total: {status: string; count: number|null}; dimensions: Record<string, Margin>};
type Feed = {generated_at: string; collection_started: string|null; weeks: Week[]};
const ageLabels: Record<string, string> = {'1': 'First week', '2': 'Weeks 2–4', '3': 'Weeks 5–24', '4': 'Week 25 or later'};
const labels = {variant: 'Base image', flavor: 'Image flavor', arch: 'Architecture', age_bucket: 'Age since first attempt'};

export default function Metrics() {
  const [feed, setFeed] = useState<Feed|null>(null);
  const [state, setState] = useState('loading');
  const [selected, setSelected] = useState('');
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/adoption', {signal: controller.signal, credentials: 'omit'})
      .then(response => {if (!response.ok) throw Error('Unavailable'); return response.json();})
      .then(data => {validateAdoption(data); setFeed(data); setState('ready'); setSelected(data.weeks.at(-1)?.week_start || '');})
      .catch(() => {if (!controller.signal.aborted) setState('unavailable');});
    return () => controller.abort();
  }, []);
  const week = feed?.weeks.find(item => item.week_start === selected);
  const max = Math.max(10, ...(feed?.weeks.map(item => item.total.count || 0) || []));
  return <Layout title="Adoption metrics" description="Public weekly estimates of participating TunaOS installations, with privacy thresholds and open data.">
    <header className={page.hero}><div className={page.heroInner}>
      <span className={page.eyebrow}>Open adoption data</span>
      <Heading as="h1" className={page.heroTitle}>TunaOS, week by week</Heading>
      <p className={page.heroLede}>Weekly estimates of reporting installations across TunaOS images. Participation and privacy limits shape these numbers; they do not count unique people.</p>
    </div></header>
    <main>
      <section className={`${page.section} ${page.sectionFirst}`}><div className={page.sectionInner}>
        <Heading as="h2">Reporting installations</Heading>
        <div role="status" aria-live="polite" className={styles.notice}>
          {state === 'loading' && 'Loading the public metrics feed…'}
          {state === 'unavailable' && 'Metrics are unavailable. The collector may not be deployed or reachable. Missing data is not zero adoption.'}
          {state === 'ready' && !feed?.collection_started && 'Collection has not started. No adoption estimate is available.'}
          {state === 'ready' && feed?.collection_started && !feed.weeks.length && 'Collection has started. No published UTC weeks are available.'}
          {!!feed?.weeks.length && `Public feed generated ${new Date(feed.generated_at).toUTCString()}. Each week runs Monday to Monday in UTC.`}
        </div>
        {feed && adoptionWarnings(feed).map(warning => <p key={warning} role="status" className={styles.notice}>{warning}</p>)}
        {!!feed?.weeks.length && <>
          <div className={styles.chart} aria-hidden="true">{feed.weeks.map(item => <div key={item.week_start} className={styles.column} title={`${item.week_start}: ${estimateText(item.total)}`}>
            {item.total.status === 'reported' ? <div className={styles.bar} style={{height: `${item.total.count === 0 ? 0 : Math.max(2, (item.total.count || 0) / max * 100)}%`}}/> : <span className={styles.gap}>·</span>}
          </div>)}</div>
          <p className={styles.caption}>Weekly trend, oldest to newest. Gaps indicate suppressed or unavailable values. The table contains the same data.</p>
          <div className={styles.tableWrap}><table><caption>Weekly reporting installation estimates</caption><thead><tr><th scope="col">Week starting (UTC)</th><th scope="col">Estimate</th><th scope="col">Collection quality</th></tr></thead><tbody>{[...feed.weeks].reverse().map(item => <tr key={item.week_start}><th scope="row">{item.week_start}</th><td>{estimateText(item.total)}</td><td>{item.status}</td></tr>)}</tbody></table></div>
          <Heading as="h2">Image mix</Heading>
          <label htmlFor="metrics-week">Choose a closed week </label>
          <select id="metrics-week" value={selected} onChange={event => setSelected(event.target.value)}>{[...feed.weeks].reverse().map(item => <option key={item.week_start}>{item.week_start}</option>)}</select>
          {week?.status === 'degraded' && <p role="status">Collection was degraded this week. These estimates may be incomplete.</p>}
          <div className={`${page.grid} ${styles.mix}`}>{week && Object.entries(labels).map(([dimension, label]) => {
            const margin = week.dimensions[dimension]; const sum = Object.values(margin.counts || {}).reduce((a,b) => a+b, 0);
            return <section className={page.panel} key={dimension}><Heading as="h3">{label}</Heading>
              {margin.status !== 'reported' ? <p>{margin.status === 'suppressed' ? 'This whole category is suppressed to protect small groups.' : 'Category data is unavailable.'}</p> : <table><caption className={styles.caption}>Shares of published rounded counts</caption><thead><tr><th scope="col">Category</th><th scope="col">Estimate</th><th scope="col">Share</th></tr></thead><tbody>{Object.entries(margin.counts!).sort((a,b) => b[1]-a[1]).map(([key, n]) => <tr key={key}><th scope="row">{dimension === 'age_bucket' ? ageLabels[key] : key}</th><td>{n.toLocaleString()}–{(n+9).toLocaleString()}</td><td>{sum ? `${Math.round(n / sum * 100)}%` : '—'}</td></tr>)}</tbody></table>}
            </section>;
          })}</div>
        </>}
        <p><a href="/api/adoption" download="tunaos-adoption.json">Download the public JSON feed</a></p>
        <noscript>Enable JavaScript to load the dashboard, or download the public JSON feed.</noscript>
      </div></section>
      <section className={`${page.section} ${page.sectionAlt}`}><div className={`${page.sectionInner} ${page.sectionNarrow} ${page.prose}`}>
        <Heading as="h2">How to read the numbers</Heading>
        <p>The client makes at most one reporting attempt per UTC week. Reports include base image, image flavor, architecture, and a broad age bucket since its first eligible attempt. Age starts at the first eligible attempt, not the installation date. A failed request also starts this clock. Live media and CI do not participate. Offline systems, disabled reporting, resets, reinstalls, and automated reports affect estimates.</p>
        <p>Only closed UTC weeks are published. Counts round down to multiples of ten: 120 means an estimate of 120–129 reports. Counts from one to nine are suppressed. If any group in a category is too small, the whole category is hidden. Categories are separate totals, never a cross-tabulation. Rounded category counts may not add up to the rounded total. Shares use the published rounded category counts.</p>
        <p>These are reporting installation estimates, not exact installed systems, unique users, individual retention, or download counts. Degraded weeks can undercount; unavailable and suppressed values must not be read as zero.</p>
        <Heading as="h2">Privacy and participation</Heading>
        <p>The client sends no device identifier, account, hardware inventory, or identifier hash. Cloudflare necessarily processes source IP addresses to deliver requests. The collector stores aggregate counters; database history can allow operators to reconstruct a report category tuple. Cloudflare automatically retains database recovery history for up to 30 days. Deletion does not immediately erase that history. This is not a promise of absolute anonymity.</p>
        <p>This dashboard requests only the public feed from this site. It adds no analytics, cookies, or external tracking scripts. The proxy copies no visitor cookies or headers. Cloudflare may add transport headers; the collector does not read or store them.</p>
        <p>Reporting is enabled by default on installed images once collection is configured. Your opt-out persists across image updates. Manage participation on an installed TunaOS system:</p>
        <pre><code>{'sudo tunaos-countme status\nsudo tunaos-countme enable\nsudo tunaos-countme disable'}</code></pre>
        <p>Disable creates <code>/etc/tunaos/countme/disabled</code> and masks both <code>tunaos-countme.timer</code> and <code>tunaos-countme.service</code>. Enable explicitly permits weekly reports. Changing this choice affects future reports; already published aggregates remain public.</p>
      </div></section>
    </main>
  </Layout>;
}
