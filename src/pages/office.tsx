import type {ReactNode} from 'react';
import clsx from 'clsx';
import Head from '@docusaurus/Head';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import Icon, {type IconName} from '@site/src/components/Icon';

import styles from '@site/src/css/page.module.css';

const INSTALL_ALL = [
  'flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo',
  'flatpak install tuna-os org.tunaos.letters org.tunaos.tables org.tunaos.decks',
].join('\n');

const APPS: {
  id: string;
  name: string;
  icon: IconName;
  flatpak: string;
  summary: string;
  features: string[];
}[] = [
  {
    id: 'letters',
    name: 'Letters',
    icon: 'code',
    flatpak: 'org.tunaos.letters',
    summary: 'Pure Rust GTK4 word processor for the GNOME desktop — no WebKit.',
    features: [
      'Native DOCX + ODT I/O',
      'CommonMark-faithful Markdown',
      'Footnotes, autosave, crash recovery',
      'Ctrl+K command palette',
    ],
  },
  {
    id: 'tables',
    name: 'Tables',
    icon: 'grid',
    flatpak: 'org.tunaos.tables',
    summary: 'Pure Rust GTK4 spreadsheet — no WebKit.',
    features: [
      '83 formulas via ironcalc_base',
      'XLSX, XLS, ODS',
      'Fill handle, named ranges, row filtering',
      'Excel-compatible keyboard shortcuts',
    ],
  },
  {
    id: 'decks',
    name: 'Decks',
    icon: 'layers',
    flatpak: 'org.tunaos.decks',
    summary: 'Pure Rust GTK4 presentation app — no WebKit.',
    features: [
      'Native GTK canvas editing',
      'Master slides from PPTX',
      'Object inspector + presenter pill',
      'Multi-page PDF export',
    ],
  },
];

function AppCard({app}: {app: (typeof APPS)[number]}): ReactNode {
  return (
    <div className={styles.card}>
      <span className={styles.cardIcon}>
        <Icon name={app.icon} size={22} />
      </span>
      <Heading as="h2" className={styles.cardTitle}>
        {app.name}
      </Heading>
      <p className={styles.cardText}>{app.summary}</p>
      <ul className={styles.linkList} style={{marginTop: '1rem'}}>
        {app.features.map((f) => (
          <li key={f} className={styles.cardText}>
            {f}
          </li>
        ))}
      </ul>
      <div className={styles.cardFoot}>
        <Link className={clsx('button', styles.btnPrimary, styles.btnSmall)} to={`/${app.id}`}>
          Learn more
        </Link>
        <Link
          className={clsx('button', styles.btnGhost, styles.btnSmall)}
          to={`/install?app=${app.flatpak}`}>
          Install
        </Link>
      </div>
    </div>
  );
}

export default function Office(): ReactNode {
  return (
    <Layout
      title="GNOME Office Suite"
      description="Tables, Letters, and Decks — a modern office suite for the GNOME desktop.">
      <Head>
        <meta property="og:title" content="GNOME Office Suite — TunaOS" />
        <meta property="og:description" content="Tables, Letters, and Decks — a modern, native office suite for GNOME." />
        <meta property="og:image" content="https://tunaos.org/img/tunaos-social-card.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="GNOME Office Suite — TunaOS" />
        <meta name="twitter:description" content="Tables, Letters, and Decks — a modern, native office suite for GNOME." />
        <meta name="twitter:image" content="https://tunaos.org/img/tunaos-social-card.png" />
      </Head>

      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>GNOME office suite</span>
          <Heading as="h1" className={styles.heroTitle}>
            Letters, Tables and Decks
          </Heading>
          <p className={styles.heroLede}>
            A word processor, a spreadsheet and a presentation app for the GNOME
            desktop, written in Rust with GTK 4 and Libadwaita and shipped as Flatpaks.
            No WebKit and no Electron. They read DOCX, ODT, XLSX, XLS, ODS and PPTX,
            and export PDF.
          </p>
        </div>
      </header>

      <main>
        <section className={clsx(styles.section, styles.sectionFirst)}>
          <div className={clsx(styles.sectionInner, styles.sectionNarrow)}>
            <div className={styles.sectionHead}>
              <Heading as="h2" className={styles.sectionTitle}>
                <span className={styles.sectionMark}>01.</span>
                Install the whole suite
              </Heading>
              <p className={styles.sectionSub}>
                Add the Flatpak remote, then install all three apps at once.
              </p>
            </div>
            <pre className={styles.code}>
              <code>{INSTALL_ALL}</code>
            </pre>
            <div className={clsx(styles.btnRow, styles.btnRowLeft)}>
              <Link className={clsx('button', styles.btnPrimary)} to="/flatpak">
                Setup instructions
              </Link>
            </div>
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionAlt)}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Heading as="h2" className={styles.sectionTitle}>
                <span className={styles.sectionMark}>02.</span>
                The three apps
              </Heading>
            </div>
            <div className={styles.grid}>
              {APPS.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
