import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';

const APPS: Record<string, {
  name: string;
  emoji: string;
  summary: string;
  tagline: string;
}> = {
  'org.tunaos.letters': {
    name: 'Letters',
    emoji: '📝',
    summary: 'Modern word processor for the GNOME desktop.',
    tagline: 'DOCX, ODT, Markdown, HTML, and PDF export.',
  },
  'org.tunaos.tables': {
    name: 'Tables',
    emoji: '📊',
    summary: 'GNOME spreadsheet with ~400 Excel-compatible functions.',
    tagline: 'XLSX, ODS, CSV, charts, and multi-sheet workbooks.',
  },
  'org.tunaos.decks': {
    name: 'Decks',
    emoji: '📽️',
    summary: 'GNOME presentation app with Fabric.js and Reveal.js.',
    tagline: 'PPTX, ODP, and multi-page PDF export.',
  },
};

function Content(): ReactNode {
  const [appId, setAppId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAppId(params.get('app'));
  }, []);

  if (!appId) {
    return (
      <div style={{textAlign: 'center', padding: '6rem 1rem'}}>
        <Heading as="h1">Install a TunaOS app</Heading>
        <p style={{color: 'var(--ifm-color-emphasis-600)'}}>
          Choose an app from the <Link to="/flatpak">Flatpak page</Link>.
        </p>
      </div>
    );
  }

  const app = APPS[appId];
  if (!app) {
    return (
      <div style={{textAlign: 'center', padding: '6rem 1rem'}}>
        <Heading as="h1">Unknown app</Heading>
        <p style={{color: 'var(--ifm-color-emphasis-600)'}}>
          <code>{appId}</code> is not a recognized TunaOS app.{' '}
          <Link to="/flatpak">Browse all apps</Link>.
        </p>
      </div>
    );
  }

  return (
    <>
      <header style={{
        textAlign: 'center', padding: '3rem 1rem 1.5rem',
        background: 'radial-gradient(120% 120% at 50% -10%, #6366f1 0%, #1e3a5f 60%, #0b1220 100%)',
        color: '#fff',
      }}>
        <div className="container">
          <span style={{fontSize: '3rem', display: 'block'}}>{app.emoji}</span>
          <Heading as="h1" style={{marginTop: '0.5rem'}}>Install {app.name}</Heading>
          <p style={{fontSize: '1.1rem', opacity: 0.85}}>{app.summary}</p>
          <p style={{opacity: 0.65}}>{app.tagline}</p>
        </div>
      </header>

      <main className="container" style={{maxWidth: 680, padding: '2.5rem 1rem'}}>
        {/* Step 1: Add remote */}
        <section style={{marginBottom: '2.5rem'}}>
          <Heading as="h2">1. Add the TunaOS remote</Heading>
          <p style={{color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.75rem'}}>
            If you haven&apos;t already, add the TunaOS Flatpak repository:
          </p>
          <pre style={{
            background: 'var(--prism-background-color)',
            padding: '1rem', borderRadius: 8,
            fontSize: '0.9rem',
          }}>
            <code>flatpak remote-add --if-not-exists tuna-os https://tunaos.org/flatpak/tuna-os.flatpakrepo</code>
          </pre>
        </section>

        {/* Step 2: Install */}
        <section style={{marginBottom: '2.5rem'}}>
          <Heading as="h2">2. Install {app.name}</Heading>
          <div style={{marginBottom: '1.25rem'}}>
            <a
              className="button button--lg button--primary"
              href={`/flatpak/appstream/${appId}.flatpakref`}
              style={{fontSize: '1.1rem', padding: '0.75rem 2rem'}}>
              Install {app.emoji}
            </a>
          </div>
          <p style={{color: 'var(--ifm-color-emphasis-600)', marginBottom: '0.75rem'}}>
            Or install manually from the terminal:
          </p>
          <pre style={{
            background: 'var(--prism-background-color)',
            padding: '1rem', borderRadius: 8,
            fontSize: '0.9rem',
          }}>
            <code>flatpak install tuna-os {appId}</code>
          </pre>
        </section>

        {/* Step 3: Run */}
        <section style={{marginBottom: '2.5rem'}}>
          <Heading as="h2">3. Run</Heading>
          <pre style={{
            background: 'var(--prism-background-color)',
            padding: '1rem', borderRadius: 8,
            fontSize: '0.9rem',
          }}>
            <code>flatpak run {appId}</code>
          </pre>
          <p style={{marginTop: '0.75rem', color: 'var(--ifm-color-emphasis-500)', fontSize: '0.85rem'}}>
            Or launch {app.name} from your app launcher — it&apos;ll appear alongside your other apps.
          </p>
        </section>

        <hr style={{margin: '2rem 0', opacity: 0.15}} />
        <p style={{textAlign: 'center', color: 'var(--ifm-color-emphasis-500)', fontSize: '0.85rem'}}>
          <Link to="/flatpak">← Back to all apps</Link>
        </p>
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
