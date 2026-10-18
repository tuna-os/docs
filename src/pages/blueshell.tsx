import type {ReactNode} from 'react';
import {useState} from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Head from '@docusaurus/Head';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Icon from '@site/src/components/Icon';
import BlueshellTerminal, {BlueshellTerminalStatic} from '@site/src/components/BlueshellTerminal';
import {getProject} from '@site/src/data/projects';

import pageStyles from '@site/src/css/page.module.css';
import styles from './blueshell.module.css';

const RELATED = ['ghostty', 'tavern', 'compass', 'corral'];

function InstallItem({label, code}: {label: string; code: string}): ReactNode {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };
  return (
    <div className={styles.installItem}>
      <div className={styles.installHead}>
        <span>{label}</span>
        <button type="button" className={styles.copyBtn} onClick={() => void copy()}>
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className={styles.installCode}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function BlueshellPage(): ReactNode {
  const project = getProject('blueshell')!;
  const related = RELATED.map((id) => getProject(id)).filter((p) => p !== undefined);
  return (
    <Layout title={project.name} description={project.tagline}>
      <Head>
        <meta property="og:title" content={`${project.name} — TunaOS`} />
        <meta property="og:description" content={project.tagline} />
        <meta property="og:image" content="https://tunaos.org/img/tunaos-social-card.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.name} — TunaOS`} />
        <meta name="twitter:description" content={project.tagline} />
        <meta name="twitter:image" content="https://tunaos.org/img/tunaos-social-card.png" />
      </Head>
      <main>
        <section className={pageStyles.section}>
          <div className={clsx('container', styles.heroGrid)}>
            <div>
              <p className={pageStyles.eyebrow}>Container-native terminal</p>
              <Heading as="h1" className={pageStyles.heroTitle}>
                {project.name} <span className={pageStyles.chip}>Alpha</span>
              </Heading>
              <p className={pageStyles.heroLede}>{project.tagline}</p>
              <p>{project.lede}</p>
              <div className={pageStyles.btnRow}>
                {project.flathub && (
                  <a className={clsx('button button--lg', pageStyles.btnPrimary)} href={`/install?app=${project.flathub}`}>
                    Install
                  </a>
                )}
                {project.docs && (
                  <Link className={clsx('button button--lg', pageStyles.btnGhost)} to={project.docs}>
                    Documentation
                  </Link>
                )}
                <a className={clsx('button button--lg', pageStyles.btnGhost)} href={project.repo}>
                  GitHub
                </a>
              </div>
            </div>
            <div className={styles.terminalCol}>
              <BrowserOnly fallback={<BlueshellTerminalStatic />}>
                {() => <BlueshellTerminal installCode={project.install?.[0]?.code ?? ''} />}
              </BrowserOnly>
            </div>
          </div>
        </section>

        <section className={clsx(pageStyles.section, pageStyles.sectionAlt)}>
          <div className={clsx('container', pageStyles.sectionInner)}>
            <div className={pageStyles.sectionHead}>
              <Heading as="h2" className={pageStyles.sectionTitle}>
                Features
              </Heading>
            </div>
            <div className={pageStyles.grid}>
              {project.features.map((f) => (
                <div key={f.title} className={pageStyles.card}>
                  <Heading as="h3" className={pageStyles.cardTitle}>
                    {f.emoji} {f.title}
                  </Heading>
                  <p className={pageStyles.cardText}>{f.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {project.install && (
          <section className={pageStyles.section}>
            <div className={clsx('container', pageStyles.sectionInner)}>
              <div className={pageStyles.sectionHead}>
                <Heading as="h2" className={pageStyles.sectionTitle}>
                  Get started
                </Heading>
              </div>
              {project.install.map((i) => (
                <InstallItem key={i.label} label={i.label} code={i.code} />
              ))}
            </div>
          </section>
        )}

        <section className={clsx(pageStyles.section, pageStyles.sectionAlt)}>
          <div className={clsx('container', pageStyles.sectionInner)}>
            <div className={pageStyles.sectionHead}>
              <Heading as="h2" className={pageStyles.sectionTitle}>
                Related projects
              </Heading>
            </div>
            <div className={pageStyles.grid}>
              {related.map((p) => (
                <Link key={p.id} to={`/${p.id}`} className={pageStyles.cardLinked}>
                  <span className={pageStyles.cardIcon}>
                    <Icon name={p.icon} size={20} />
                  </span>
                  <span>
                    <strong className={pageStyles.cardTitle}>{p.name}</strong>
                    <span className={pageStyles.cardText}>{p.tagline}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
