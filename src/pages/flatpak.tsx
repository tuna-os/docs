import type {ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import Icon, {type IconName} from '@site/src/components/Icon';

import styles from '@site/src/css/page.module.css';

const REMOTE_ADD =
  'flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo';

const APPS: {
  id: string;
  name: string;
  icon: IconName;
  description: string;
}[] = [
  {
    id: 'org.tunaos.letters',
    name: 'Letters',
    icon: 'code',
    description: 'Pure Rust GTK4 word processor — DOCX, ODT, Markdown, PDF export.',
  },
  {
    id: 'org.tunaos.tables',
    name: 'Tables',
    icon: 'grid',
    description: 'Pure Rust GTK4 spreadsheet — 83 Excel-compatible functions.',
  },
  {
    id: 'org.tunaos.decks',
    name: 'Decks',
    icon: 'layers',
    description: 'Pure Rust GTK4 presentation app — native canvas editing.',
  },
  {
    id: 'org.tunaos.mariner',
    name: 'Mariner',
    icon: 'box',
    description:
      'GNOME Files alternative — typeahead, dual-pane, Quick Look, full-text search.',
  },
  {
    id: 'org.tunaos.tavern',
    name: 'Tavern',
    icon: 'package',
    description: 'Homebrew client for Linux — GTK 4 + Libadwaita.',
  },
  {
    id: 'org.tunaos.BlueShell',
    name: 'BlueShell',
    icon: 'activity',
    description:
      'Container-native terminal for GNOME — the Ghostty engine, the Ptyxis experience.',
  },
  {
    id: 'com.mitchellh.ghostty',
    name: 'Ghostty',
    icon: 'zap',
    description: 'The upstream terminal, republished here unmodified and rebuilt weekly.',
  },
  {
    id: 'org.bootcinstaller.Installer',
    name: 'bootc-installer',
    icon: 'disc',
    description: 'Graphical OS installer for bootc-based systems.',
  },
];

function AppCard({app}: {app: (typeof APPS)[number]}): ReactNode {
  return (
    <Link to={`/install?app=${app.id}`} className={clsx(styles.card, styles.cardLinked)}>
      <span className={styles.cardIcon}>
        <Icon name={app.icon} size={22} />
      </span>
      <Heading as="h3" className={styles.cardTitle}>
        {app.name}
      </Heading>
      <p className={styles.cardText}>{app.description}</p>
      <div className={styles.cardFoot}>
        <span className={clsx(styles.chip, styles.chipPlain)}>{app.id}</span>
      </div>
    </Link>
  );
}

export default function Flatpak(): ReactNode {
  return (
    <Layout
      title="Flatpak"
      description="The TunaOS Flatpak remote: the GNOME office suite, terminals, a file manager, and a Homebrew front end.">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Flatpak remote</span>
          <Heading as="h1" className={styles.heroTitle}>
            The TunaOS Flatpak remote
          </Heading>
          <p className={styles.heroLede}>
            Letters, Tables, Decks, Mariner, Tavern, BlueShell, Ghostty and
            bootc-installer, built here and installable on any distribution that runs
            Flatpak.
          </p>
        </div>
      </header>

      <main>
        <section className={clsx(styles.section, styles.sectionFirst)}>
          <div className={clsx(styles.sectionInner, styles.sectionNarrow)}>
            <div className={styles.sectionHead}>
              <Heading as="h2" className={styles.sectionTitle}>
                <span className={styles.sectionMark}>01.</span>
                Add the remote
              </Heading>
            </div>
            <pre className={styles.code}>
              <code>{REMOTE_ADD}</code>
            </pre>
            <p className={styles.prose} style={{marginTop: '1rem'}}>
              Or download{' '}
              <a href="/flatpak/tuna-os.flatpakrepo">tuna-os.flatpakrepo</a> and open it
              with GNOME Software.
            </p>
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionAlt)}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Heading as="h2" className={styles.sectionTitle}>
                <span className={styles.sectionMark}>02.</span>
                Available apps
              </Heading>
              <p className={styles.sectionSub}>
                Each app has an install page with its flatpakref and terminal commands.
              </p>
            </div>
            <div className={styles.grid}>
              {APPS.map((app) => (
                <AppCard key={app.id} app={app} />
              ))}
            </div>
          </div>
        </section>

        <section className={styles.section}>
          <div className={clsx(styles.sectionInner, styles.sectionNarrow)}>
            <div className={styles.sectionHead}>
              <Heading as="h2" className={styles.sectionTitle}>
                <span className={styles.sectionMark}>03.</span>
                Install an app
              </Heading>
            </div>
            <pre className={styles.code}>
              <code>flatpak install tuna-os org.tunaos.letters</code>
            </pre>
            <p className={styles.prose} style={{marginTop: '1rem'}}>
              Replace <code>org.tunaos.letters</code> with any app ID above. The office
              suite is built from{' '}
              <a href="https://github.com/tuna-os/gtk-office-suite">
                tuna-os/gtk-office-suite
              </a>
              .
            </p>
            <div className={clsx(styles.btnRow, styles.btnRowLeft)}>
              <Link className={clsx('button', styles.btnPrimary)} to="/office">
                Office suite
              </Link>
              <Link className={clsx('button', styles.btnGhost)} to="/projects">
                All projects
              </Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
