import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

const APP_URL = 'https://tunaos-iso-builder.trogdor30001.workers.dev';

const FEATURES: {emoji: string; title: string; blurb: string}[] = [
  {
    emoji: '🌐',
    title: 'Runs entirely in your browser',
    blurb:
      'Registry pull, filesystem authoring, and ISO assembly all happen locally in WebAssembly. Nothing is uploaded anywhere.',
  },
  {
    emoji: '📦',
    title: 'Any bootable container image',
    blurb:
      'Point it at a TunaOS image or your own bootc-style image on GHCR. It inspects the image and detects the desktop automatically.',
  },
  {
    emoji: '⚙️',
    title: 'Same engine as CI',
    blurb:
      'The builder is tacklebox’s pure-Go core compiled to WASM — the exact code that authors TunaOS release media, boot-verified in QEMU.',
  },
  {
    emoji: '🔗',
    title: 'Deep-linkable presets',
    blurb:
      'Everything is a URL parameter: ?image=…&flatpaks=…&label=… — share a link and anyone builds your ISO, preconfigured.',
  },
];

export default function IsoBuilderPage(): ReactNode {
  return (
    <Layout
      title="ISO Builder"
      description="Build a live TunaOS ISO from any bootable container image — entirely in your browser.">
      <main>
        <div className="hero hero--primary" style={{textAlign: 'center'}}>
          <div className="container">
            <Heading as="h1" className="hero__title">
              🐟 TunaOS ISO Builder
            </Heading>
            <p className="hero__subtitle">
              Build a live, bootable ISO from any bootable container image —
              entirely in your browser.
            </p>
            <div style={{display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap'}}>
              <Link
                className="button button--secondary button--lg"
                href={`${APP_URL}/?image=tuna-os/guppy:base`}>
                Open the builder →
              </Link>
              <Link className="button button--outline button--secondary button--lg" to="/docs/iso-builder">
                Read the guide
              </Link>
            </div>
            <p style={{marginTop: '0.75rem', opacity: 0.8, fontSize: '0.85rem'}}>
              Experimental preview — currently hosted at a test URL.
            </p>
          </div>
        </div>

        <div className="container" style={{padding: '3rem 1rem'}}>
          <div className="row">
            {FEATURES.map((f) => (
              <div key={f.title} className="col col--3" style={{marginBottom: '1.5rem'}}>
                <Heading as="h3">
                  <span style={{marginRight: '0.4rem'}}>{f.emoji}</span>
                  {f.title}
                </Heading>
                <p>{f.blurb}</p>
              </div>
            ))}
          </div>

          <Heading as="h2">How it works</Heading>
          <ol>
            <li>
              <b>Inspect</b> — enter an image like <code>tuna-os/guppy:base</code>. The engine pulls
              and unpacks it in-browser and shows the detected desktop, kernel, and bootloader.
            </li>
            <li>
              <b>Tune</b> — the flatpak preload list is prefilled for the detected desktop
              (GNOME/KDE defaults); adjust it, the volume label, or supply a tbox initramfs URL
              under <i>Advanced</i>.
            </li>
            <li>
              <b>Build</b> — the EROFS live root, EFI system partition, and ISO9660/El&nbsp;Torito
              image are authored in WASM and stream straight to your disk.
            </li>
          </ol>
          <p>
            Full walkthrough with screenshots, URL parameter reference, and current limits:{' '}
            <Link to="/docs/iso-builder">the ISO Builder guide</Link>. The engine lives in{' '}
            <Link href="https://github.com/tuna-os/tacklebox">tuna-os/tacklebox</Link>.
          </p>
        </div>
      </main>
    </Layout>
  );
}
