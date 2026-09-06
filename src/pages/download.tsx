import type {ReactNode} from 'react';
import {useState} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import clsx from 'clsx';
import IsoDownloads from '@site/src/components/IsoDownloads';
import ImagePicker from '@site/src/components/ImagePicker';
import page from '@site/src/css/page.module.css';
import styles from './download.module.css';

function DownloadHeader(): ReactNode {
  return (
    <header className={page.hero}>
      <div className={page.heroInner}>
        <span className={page.eyebrow}>Downloads</span>
        <Heading as="h1" className={page.heroTitle}>
          Download TunaOS
        </Heading>
        <p className={page.heroLede}>
          Live ISOs for every TunaOS image and product line, served from{' '}
          <a href="https://download.tunaos.org">download.tunaos.org</a>. The picker below
          narrows the list by base and desktop; the{' '}
          <a href="/docs/desktop-comparison">desktop comparison</a> covers the
          differences in more detail. To pick your own flatpak set, build an ISO with
          the <a href="/iso-builder">in-browser builder</a> instead.
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
        <span>Help me choose an image</span>
        <span className={styles.chooserChevron}>{open ? '−' : '+'}</span>
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
      <main className={clsx('container', styles.main)}>
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
