import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import clsx from 'clsx';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {PROJECTS} from '@site/src/data/projects';

import styles from '@site/src/css/page.module.css';

type InstallApp = {name: string; summary: string; tagline: string};

const REMOTE_ADD =
  'flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo';

// Derived from the shared project data (src/data/projects.ts) via each
// project's flathub/flatpakRust app ID — not a separate hand-maintained
// list, so a project gains (or loses) an /install page automatically.
const APPS: Record<string, InstallApp> = Object.fromEntries(
  PROJECTS.flatMap((p): [string, InstallApp][] => {
    const entries: [string, InstallApp][] = [];
    if (p.flathub) {
      entries.push([p.flathub, {
        name: p.name,
        summary: p.tagline,
        tagline: p.features[0]?.text ?? '',
      }]);
    }
    if (p.flatpakRust) {
      entries.push([p.flatpakRust, {
        name: `${p.name} (Rust)`,
        summary: p.tagline,
        tagline: 'Pure Rust GTK4 rewrite — no WebKit, just speed.',
      }]);
    }
    return entries;
  }),
);

function Notice({title, children}: {title: string; children: ReactNode}): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <Heading as="h1" className={styles.heroTitle}>
          {title}
        </Heading>
        <p className={styles.heroLede}>{children}</p>
      </div>
    </header>
  );
}

function Step({
  mark,
  title,
  children,
}: {
  mark: string;
  title: string;
  children: ReactNode;
}): ReactNode {
  return (
    <section className={styles.section}>
      <div className={clsx(styles.sectionInner, styles.sectionNarrow)}>
        <div className={styles.sectionHead}>
          <Heading as="h2" className={styles.sectionTitle}>
            <span className={styles.sectionMark}>{mark}</span>
            {title}
          </Heading>
        </div>
        {children}
      </div>
    </section>
  );
}

function Content(): ReactNode {
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAppId(params.get('app'));
  }, []);

  if (!appId) {
    return (
      <Notice title="Install a TunaOS app">
        Choose an app from the <Link to="/flatpak">Flatpak page</Link>.
      </Notice>
    );
  }

  const app = APPS[appId];
  if (!app) {
    return (
      <Notice title="Unknown app">
        <code>{appId}</code> is not a recognized TunaOS app.{' '}
        <Link to="/flatpak">Browse all apps</Link>.
      </Notice>
    );
  }

  return (
    <>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Install</span>
          <Heading as="h1" className={styles.heroTitle}>
            {app.name}
          </Heading>
          <p className={styles.heroLede}>{app.summary}</p>
          {app.tagline && <p className={styles.heroNote}>{app.tagline}</p>}
        </div>
      </header>

      <main>
        <Step mark="01." title="Add the Flatpak remote">
          <p className={styles.prose} style={{marginBottom: '0.9rem'}}>
            If you have not already, add the TunaOS Flatpak repository:
          </p>
          <pre className={styles.code}>
            <code>{REMOTE_ADD}</code>
          </pre>
        </Step>

        <Step mark="02." title={`Install ${app.name}`}>
          <div className={clsx(styles.btnRow, styles.btnRowLeft)} style={{marginTop: 0}}>
            <a
              className={clsx('button', styles.btnPrimary)}
              href={`/flatpak/appstream/${appId}.flatpakref`}>
              Install {app.name}
            </a>
          </div>
          <p className={styles.prose} style={{margin: '1.5rem 0 0.9rem'}}>
            Or install it from the terminal:
          </p>
          <pre className={styles.code}>
            <code>flatpak install tuna-os {appId}</code>
          </pre>
        </Step>

        <Step mark="03." title="Run it">
          <pre className={styles.code}>
            <code>flatpak run {appId}</code>
          </pre>
          <p className={styles.prose} style={{marginTop: '0.9rem'}}>
            Or launch {app.name} from your app launcher — it appears alongside your
            other apps.
          </p>
          <p className={styles.backLink}>
            <Link to="/flatpak">← Back to all apps</Link>
          </p>
        </Step>
      </main>
    </>
  );
}

export default function Install(): ReactNode {
  return (
    <Layout title="Install" description="Install a TunaOS Flatpak app.">
      <BrowserOnly>{() => <Content />}</BrowserOnly>
    </Layout>
  );
}
