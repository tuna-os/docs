import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import feed from '@site/src/data/contributors.json';
import styles from './styles.module.css';

type Contributor = {
  login: string;
  id: number;
  contributions: number;
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
          Built by {contributors.length} humans
        </Heading>
        <p className={styles.sub}>
          Every human contributor across the {FEED.org} organisation — bots and AI agents need not
          apply. Data refreshed {generated}.
        </p>
        <ul className={styles.grid}>
          {contributors.map((c) => (
            <li key={c.login}>
              <a
                href={`https://github.com/${c.login}`}
                title={`${c.login} — ${c.contributions} contributions`}
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
          <a href={`https://github.com/orgs/${FEED.org}/people`}>Join them</a>
        </p>
      </div>
    </section>
  );
}
