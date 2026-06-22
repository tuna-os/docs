import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import AnimatedEmoji from '@site/src/components/AnimatedEmoji';

const APPS = [
  {
    id: 'letters',
    name: 'Letters',
    emoji: '📝',
    flatpak: 'org.tunaos.letters',
    summary: 'Modern word processor for the GNOME desktop.',
    features: ['DOCX, ODT, Markdown, HTML I/O', 'PDF export via WeasyPrint', 'Live word count', 'Find/replace, tables, lists'],
  },
  {
    id: 'tables',
    name: 'Tables',
    emoji: '📊',
    flatpak: 'org.tunaos.tables',
    summary: 'GNOME spreadsheet with ~400 Excel-compatible functions.',
    features: ['~400 formulas via HyperFormula', 'XLSX, ODS, CSV', 'Charts, sort, filter, freeze panes', 'Excel-compatible keyboard shortcuts'],
  },
  {
    id: 'decks',
    name: 'Decks',
    emoji: '📽️',
    flatpak: 'org.tunaos.decks',
    summary: 'GNOME presentation app with Fabric.js and Reveal.js.',
    features: ['Fabric.js canvas editing', 'Reveal.js fullscreen present mode', 'PPTX, ODP I/O', '30-level undo/redo'],
  },
];

function AppCard({app}: {app: (typeof APPS)[number]}): ReactNode {
  return (
    <div style={{
      borderRadius: 16,
      background: 'var(--ifm-card-background-color)',
      border: '1px solid var(--ifm-color-emphasis-200)',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '2rem 1.5rem 1rem',
        textAlign: 'center',
      }}>
        <span style={{fontSize: '3rem', display: 'block', marginBottom: '0.5rem'}}>
          <AnimatedEmoji emoji={app.emoji} size={64} />
        </span>
        <Heading as="h2" style={{fontSize: '1.4rem', marginBottom: '0.25rem'}}>
          <Link to={`/${app.id}`} style={{color: 'inherit', textDecoration: 'none'}}>
            {app.name}
          </Link>
        </Heading>
        <p style={{color: 'var(--ifm-color-emphasis-600)', fontSize: '0.95rem'}}>
          {app.summary}
        </p>
      </div>
      <ul style={{
        listStyle: 'none', margin: 0, padding: '0 1.5rem 1.5rem',
        fontSize: '0.9rem', color: 'var(--ifm-color-emphasis-700)',
      }}>
        {app.features.map((f) => (
          <li key={f} style={{padding: '0.35rem 0', borderBottom: '1px solid var(--ifm-color-emphasis-100)'}}>
            <span style={{marginRight: '0.5rem', opacity: 0.4}}>·</span>{f}
          </li>
        ))}
      </ul>
      <div style={{
        display: 'flex', gap: '0.5rem', padding: '0 1.5rem 1.5rem',
      }}>
        <Link className="button button--primary button--block button--sm" to={`/${app.id}`}>
          Learn more
        </Link>
        <Link className="button button--outline button--block button--sm" to={`/install?app=${app.flatpak}`}>
          Install
        </Link>
      </div>
    </div>
  );
}

export default function Office(): ReactNode {
  return (
    <Layout title="GNOME Office Suite" description="Tables, Letters, and Decks — a modern office suite for the GNOME desktop.">
      <header style={{
        textAlign: 'center', padding: '4rem 1rem 2rem',
        background: 'radial-gradient(120% 120% at 50% -10%, #f59e0b 0%, #92400e 60%, #0b1220 100%)',
        color: '#fff',
      }}>
        <div className="container">
          <Heading as="h1">🏢 GNOME Office Suite</Heading>
          <p style={{fontSize: '1.2rem', opacity: 0.85, maxWidth: 620, margin: '1rem auto'}}>
            Tables, Letters, and Decks — a modern, native office suite for the GNOME desktop.
            Built with GTK 4, Libadwaita, and Flatpak.
          </p>
        </div>
      </header>

      <main className="container" style={{padding: '3rem 0'}}>
        <section style={{marginBottom: '3rem', textAlign: 'center'}}>
          <Heading as="h2">Install the whole suite</Heading>
          <p style={{color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.75rem'}}>
            Add the TunaOS remote, then install all three apps at once:
          </p>
          <pre style={{
            background: 'var(--prism-background-color)',
            padding: '1.25rem', borderRadius: 8,
            fontSize: '0.9rem', textAlign: 'left',
            maxWidth: 700, margin: '0 auto',
          }}>
            <code>{'flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo'}</code>
            {'\n'}<code>{'flatpak install tuna-os org.tunaos.letters org.tunaos.tables org.tunaos.decks'}</code>
          </pre>
          <p style={{marginTop: '1rem'}}>
            <Link className="button button--primary button--lg" to="/flatpak">
              Setup instructions →
            </Link>
          </p>
        </section>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {APPS.map((app) => (
            <AppCard key={app.id} app={app} />
          ))}
        </div>
      </main>
    </Layout>
  );
}
