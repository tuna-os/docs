import type {ReactNode} from 'react';
import {useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import IsoDownloads from '@site/src/components/IsoDownloads';
import ImagePicker from '@site/src/components/ImagePicker';
import styles from './download.module.css';

function DownloadHeader(): ReactNode {
  return (
    <header className={styles.header}>
      <div className="container">
        <Heading as="h1" className={styles.title}>
          Download TunaOS
        </Heading>
        <p className={styles.subtitle}>
          Bootable live ISOs for every TunaOS image and product line, served
          fresh from <a href="https://download.tunaos.org">download.tunaos.org</a>.
          Not sure which one? Let the picker choose for you. Prefer it your
          way? <a href="/iso-builder">Build your own ISO in the browser</a> —
          any TunaOS image, your flatpak picks, no downloads middleman.
        </p>
      </div>
    </header>
  );
}

function HelpMeChoose(): ReactNode {
  const [open, setOpen] = useState(false);
  return (
    <section className={styles.chooser}>
      <button
        className={styles.chooserToggle}
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-expanded={open}
      >
        <span>🧭 Help me choose an image</span>
        <span className={styles.chooserChevron}>{open ? '▾' : '▸'}</span>
      </button>
      {open && (
        <div className={styles.chooserBody}>
          <ImagePicker />
        </div>
      )}
    </section>
  );
}

export default function Download(): ReactNode {
  return (
    <Layout
      title="Download"
      description="Download bootable live ISOs for all TunaOS images — Albacore, Yellowfin, Skipjack, Bonito, Dakota and more.">
      <DownloadHeader />
      <main className="container margin-bottom--xl">
        <HelpMeChoose />
        <IsoDownloads />
        <div className={styles.help}>
          <Heading as="h2">Writing the ISO to a USB drive</Heading>
          <p>
            These are hybrid UEFI images — write one directly to a USB stick and
            boot it:
          </p>
          <pre>
            <code>sudo dd if=tunaos.iso of=/dev/sdX bs=4M status=progress oflag=direct</code>
          </pre>
          <p>
            Replace <code>/dev/sdX</code> with your USB device (double-check with{' '}
            <code>lsblk</code> — this erases the target). On Windows or macOS,{' '}
            <a href="https://etcher.balena.io/">balenaEtcher</a> works too. After
            booting, follow the <a href="/docs/installer">installer guide</a>.
          </p>
        </div>
      </main>
    </Layout>
  );
}
