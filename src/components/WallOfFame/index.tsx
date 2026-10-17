import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import feed from '@site/src/data/contributors.json';
import styles from './styles.module.css';

type Contributor = {
  login: string;
  id: number;
  merged_prs: number;
  repos: string[];
};

const FEED = feed as {org: string; generated_at: string; contributors: Contributor[]};

function avatarUrl(id: number): string {
  return `https://avatars.githubusercontent.com/u/${id}?v=4&s=96`;
}

export default function WallOfFame(): ReactNode {
  const contributors = FEED.contributors;
  if (contributors.length === 0) return null;
  const generated = new Date(FEED.generated_at).toISOString().slice(0, 10);
  return (
    <section className={styles.wall} aria-label="Wall of fame">
      <div className="container">
        <span className={styles.eyebrow}>Wall of fame</span>
        <Heading as="h2" id="contributors" className={styles.title}>
          {contributors.length} contributors
        </Heading>
        <p className={styles.sub}>
          Authors of merged pull requests in the {FEED.org} organisation, including forks and
          archived projects. Known bots and AI agents are excluded. Updated {generated}.
        </p>
        <ul className={styles.grid}>
          {contributors.map((c) => (
            <li key={c.login}>
              <a
                href={`https://github.com/${c.login}`}
                title={`${c.login} — ${c.merged_prs} merged pull ${c.merged_prs === 1 ? 'request' : 'requests'}`}
                aria-label={`${c.login} on GitHub`}
              >
                <img
                  src={avatarUrl(c.id)}
                  alt={c.login}
                  width={48}
                  height={48}
                  loading="lazy"
                  decoding="async"
                />
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.more}>
          <a className="button button--primary" href="https://hub.tunaos.org/#contribute">
            Donate AI CLI time
          </a>
        </p>
        <p className={styles.sub}>
          Hive alternates tasks between School (OS and builds) and Reef (apps).
          Your local AI CLI uses your provider&apos;s subscription quota or API billing.
        </p>
        <p className={styles.more}>
          Prefer code or docs? <Link to="/docs/community">Find starter issues and community channels</Link>.
        </p>
      </div>
    </section>
  );
}
