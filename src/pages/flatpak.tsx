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
  {
    id: 'org.tunaos.tables-rust',
    name: 'Tables (Rust)',
    emoji: '🦀',
    description: 'Pure Rust GTK4 spreadsheet — fast, native, no WebKit.',
    docs: '/tables',
  },
  {
    id: 'org.tunaos.letters-rust',
    name: 'Letters (Rust)',
    emoji: '🦀',
    description: 'Pure Rust GTK4 word processor — fast, native, no WebKit.',
    docs: '/letters',
  },
  {
    id: 'org.tunaos.decks-rust',
    name: 'Decks (Rust)',
    emoji: '🦀',
    description: 'Pure Rust GTK4 presentation app — fast, native, no WebKit.',
    docs: '/decks',
  },
  {
    id: 'org.tunaos.mariner',
    name: 'Mariner',
    emoji: '🧭',
    description: 'GNOME Files alternative — typeahead, dual-pane, Quick Look, full-text search.',
    docs: 'https://github.com/romgrk/mariner',
  },
];

const RUST_APPS = [
  {
    id: 'org.tunaos.letters-rust',
    name: 'Letters (Rust)',
    emoji: '📝',
    description: 'Native GTK4 word processor — pure Rust, no Python required.',
    docs: '/letters',
  },
  {
    id: 'org.tunaos.tables-rust',
    name: 'Tables (Rust)',
    emoji: '📊',
    description: 'Native GTK4 spreadsheet — pure Rust, no Python required.',
    docs: '/tables',
  },
  {
    id: 'org.tunaos.decks-rust',
    name: 'Decks (Rust)',
    emoji: '📽️',
    description: 'Native GTK4 presentation app — pure Rust, no Python required.',
    docs: '/decks',
  },
];

function AppCard({app, badge}: {app: (typeof APPS)[number]; badge?: string}): ReactNode {
  return (
    <Link to={`/install?app=${app.id}`} style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      padding: '1rem 1.25rem', borderRadius: 12,
      background: 'var(--ifm-card-background-color)',
      border: '1px solid var(--ifm-color-emphasis-200)',
      textDecoration: 'none', color: 'inherit',
    }}>
      <span style={{fontSize: '2rem'}}>{app.emoji}</span>
      <div style={{flex: 1}}>
        <strong style={{display: 'block', fontSize: '1.1rem'}}>
          {app.name}
          {badge && (
            <span style={{
              marginLeft: '0.5rem', fontSize: '0.7rem',
              background: 'var(--ifm-color-warning-contrast-background)',
              color: 'var(--ifm-color-warning-contrast-foreground)',
              borderRadius: 99, padding: '0.1rem 0.5rem',
              verticalAlign: 'middle',
            }}>{badge}</span>
          )}
        </strong>
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
            Install Tables, Letters, Decks, Mariner, and more with one command.
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
            <code>flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo</code>
          </pre>
          <p style={{marginTop: '0.75rem', color: 'var(--ifm-color-emphasis-600)'}}>
            Or download the{' '}
            <a href="/flatpak/tuna-os.flatpakrepo">
              tuna-os.flatpakrepo
            </a>{' '}
            file and open it with GNOME Software.
          </p>
        </section>

        <section style={{marginBottom: '3rem'}}>
          <Heading as="h2">Available apps</Heading>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1.5rem'}}>
            {APPS.map((app) => (
              <AppCard key={app.id} app={app} />
            ))}
          </div>
        </section>

        <section style={{marginBottom: '3rem'}}>
          <Heading as="h2">🦀 Rust previews</Heading>
          <p style={{color: 'var(--ifm-color-emphasis-600)', marginBottom: '1rem'}}>
            Native GTK4 rewrites — no Python or WebKit dependency. Lighter and faster.
            Feature parity with the Python versions is in progress.
          </p>
          <div style={{display: 'flex', flexDirection: 'column', gap: '0.75rem'}}>
            {RUST_APPS.map((app) => (
              <AppCard key={app.id} app={app} badge="Preview" />
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
            <a href="https://github.com/tuna-os/hanthor-rust">Rust source →</a>
          </p>
        </section>
      </main>
    </Layout>
  );
}
