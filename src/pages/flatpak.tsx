import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';

const APPS = [
  {
    id: 'org.tunaos.letters',
    name: 'Letters',
    emoji: '📝',
    description: 'Modern word processor — DOCX, ODT, Markdown, PDF export.',
    docs: '/letters',
  },
  {
    id: 'org.tunaos.tables',
    name: 'Tables',
    emoji: '📊',
    description: 'GNOME spreadsheet — ~400 Excel-compatible functions.',
    docs: '/tables',
  },
  {
    id: 'org.tunaos.decks',
    name: 'Decks',
    emoji: '📽️',
    description: 'Presentation app — Fabric.js canvas + Reveal.js fullscreen.',
    docs: '/decks',
  },
];

function AppCard({app}: {app: (typeof APPS)[number]}): ReactNode {
  return (
    <Link to={app.docs} style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1rem 1.25rem', borderRadius: 12,
      background: 'var(--ifm-card-background-color)',
      border: '1px solid var(--ifm-color-emphasis-200)',
      textDecoration: 'none', color: 'inherit',
    }}>
      <span style={{fontSize: '2rem'}}>{app.emoji}</span>
      <div style={{flex: 1}}>
        <strong style={{display: 'block', fontSize: '1.1rem'}}>{app.name}</strong>
        <span style={{color: 'var(--ifm-color-emphasis-600)', fontSize: '0.9rem'}}>{app.description}</span>
      </div>
      <code style={{
        background: 'var(--ifm-code-background)',
        padding: '0.25rem 0.6rem', borderRadius: 6,
        fontSize: '0.8rem',
      }}>{app.id}</code>
    </Link>
  );
}

export default function Flatpak(): ReactNode {
  return (
    <Layout title="Flatpak" description="TunaOS Flatpak remote — install the GNOME office suite and more.">
      <header style={{
        textAlign: 'center', padding: '4rem 1rem 2rem',
        background: 'radial-gradient(120% 120% at 50% -10%, #6366f1 0%, #1e3a5f 60%, #0b1220 100%)',
        color: '#fff',
      }}>
        <div className="container">
          <Heading as="h1">📦 TunaOS Flatpak Remote</Heading>
          <p style={{fontSize: '1.2rem', opacity: 0.85, maxWidth: 600, margin: '1rem auto'}}>
            Install Tables, Letters, Decks, and more with one command.
          </p>
        </div>
      </header>

      <main className="container" style={{padding: '3rem 0'}}>
        <section style={{marginBottom: '3rem'}}>
          <Heading as="h2">Add the remote</Heading>
          <pre style={{
            background: 'var(--prism-background-color)',
            padding: '1.25rem', borderRadius: 8,
            fontSize: '0.95rem',
          }}>
            <code>flatpak remote-add --user tuna-os oci+https://tunaos.org/flatpak</code>
          </pre>
          <p style={{marginTop: '0.75rem', color: 'var(--ifm-color-emphasis-600)'}}>
            Or download the{' '}
            <a href="/flatpak/tuna-os.flatpakrepo">
              tuna-os.flatpakrepo
            </a>{' '}
            file and open it with GNOME Software.
          </p>
        </section>

        <section>
          <Heading as="h2">Available apps</Heading>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem'}}>
            {APPS.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>

        <section style={{marginTop: '3rem'}}>
          <Heading as="h2">Install an app</Heading>
          <p>Once the remote is added:</p>
          <pre style={{
            background: 'var(--prism-background-color)',
            padding: '1.25rem', borderRadius: 8,
            fontSize: '0.95rem',
          }}>
            <code>flatpak install tuna-os org.tunaos.letters</code>
          </pre>
          <p style={{marginTop: '0.5rem'}}>
            Replace <code>org.tunaos.letters</code> with any app ID above.{' '}
            <a href="https://github.com/tuna-os/flatpak-index">View on GitHub →</a>
          </p>
        </section>
      </main>
    </Layout>
  );
}
