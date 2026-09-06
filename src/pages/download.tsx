import type {ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import IsoDownloads from '@site/src/components/IsoDownloads';
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
          <a href="https://download.tunaos.org">download.tunaos.org</a>. The{' '}
          <a href="/docs/desktop-comparison">desktop comparison</a> covers what separates
          them, and <a href="/variants">the variants page</a> covers the bases.
        </p>
      </div>
    </header>
  );
}

// The picker used to live here behind a disclosure and again on the builder
// page. It is one flow — pick an image, then take the ISO or build one — so it
// lives on /iso-builder and this page links to it.
function ChooseBanner(): ReactNode {
  return (
    <section className={styles.chooser}>
      <div>
        <strong className={styles.chooserTitle}>Not sure which image?</strong>
        <p className={styles.chooserText}>
          Four questions narrow it to one image, with its ISO, its rebase command and a
          custom-ISO build in the browser.
        </p>
      </div>
      <Link className={clsx('button', page.btnPrimary, page.btnSmall)} to="/iso-builder">
        Find my image
      </Link>
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
        <ChooseBanner />
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
