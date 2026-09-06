import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Icon, {type IconName} from '@site/src/components/Icon';
import ImagePicker from '@site/src/components/ImagePicker';

import styles from '@site/src/css/page.module.css';

const APP_URL = 'https://iso.tunaos.org';

const FEATURES: {icon: IconName; title: string; blurb: string}[] = [
  {
    icon: 'shield',
    title: 'Runs in the browser',
    blurb:
      'Registry pull, filesystem authoring and ISO assembly all happen locally in WebAssembly. Nothing is uploaded anywhere.',
  },
  {
    icon: 'box',
    title: 'Any bootable container image',
    blurb:
      'Point it at a TunaOS image or your own bootc-style image on GHCR. It inspects the image and detects the desktop automatically.',
  },
  {
    icon: 'wrench',
    title: 'Same engine as CI',
    blurb:
      'The builder is tacklebox’s Go core compiled to WebAssembly: the same code that authors TunaOS release media in CI, which is boot-tested in QEMU.',
  },
  {
    icon: 'zap',
    title: 'Options are URL parameters',
    blurb:
      'Every option is a URL parameter (?image=…&flatpaks=…&label=…), so a link reproduces the same build for someone else.',
  },
];

export default function IsoBuilderPage(): ReactNode {
  return (
    <Layout
      title="Find an image"
      description="Pick a TunaOS image, then download its ISO or build a custom one in your browser.">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Find an image</span>
          <Heading as="h1" className={styles.heroTitle}>
            Pick an image, then take it or build it
          </Heading>
          <p className={styles.heroLede}>
            Four questions land you on one image. From there you can download its live
            ISO, copy the one-line rebase command, or hand it to the in-browser builder
            for an ISO with your own flatpak set.
          </p>
        </div>
      </header>

      <main>
        <section className={clsx(styles.section, styles.sectionFirst)}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Heading as="h2" className={styles.sectionTitle}>
                <span className={styles.sectionMark}>01.</span>
                Which image
              </Heading>
              <p className={styles.sectionSub}>
                Already know what you want? The{' '}
                <Link to="/download">download page</Link> lists every published ISO, and{' '}
                <Link to="/variants">the variants page</Link> compares the bases.
              </p>
            </div>
            <ImagePicker />
          </div>
        </section>

        <section className={clsx(styles.section, styles.sectionAlt)}>
          <div className={styles.sectionInner}>
            <div className={styles.sectionHead}>
              <Heading as="h2" className={styles.sectionTitle}>
                <span className={styles.sectionMark}>02.</span>
                Build a custom ISO
              </Heading>
              <p className={styles.sectionSub}>
                The builder turns a bootc container image into live, installable media.
                It runs in your browser: nothing is uploaded and no build host is
                involved. Picking an image above deep-links it here.
              </p>
            </div>
            <div className={styles.grid}>
              {FEATURES.map((f) => (
                <div key={f.title} className={styles.card}>
                  <span className={styles.cardIcon}>
                    <Icon name={f.icon} size={22} />
                  </span>
                  <Heading as="h3" className={styles.cardTitle}>
                    {f.title}
                  </Heading>
                  <p className={styles.cardText}>{f.blurb}</p>
                </div>
              ))}
            </div>
            <div className={clsx(styles.btnRow, styles.btnRowLeft)}>
              <Link
                className={clsx('button', styles.btnPrimary)}
                href={`${APP_URL}/?image=tuna-os/guppy:base`}>
                Open the builder
              </Link>
              <Link className={clsx('button', styles.btnGhost)} to="/docs/iso-builder">
                Read the guide
              </Link>
            </div>
            <p className={styles.note}>
              Experimental preview — currently hosted at a test URL.
            </p>
          </div>
        </section>

        <section className={styles.section}>
          <div className={clsx(styles.sectionInner, styles.sectionNarrow)}>
            <div className={styles.sectionHead}>
              <Heading as="h2" className={styles.sectionTitle}>
                <span className={styles.sectionMark}>03.</span>
                How the build works
              </Heading>
            </div>
            <ol className={clsx(styles.prose, styles.steps)}>
              <li>
                <b>Inspect</b> — enter an image like <code>tuna-os/guppy:base</code>. The
                engine pulls and unpacks it in-browser and shows the detected desktop,
                kernel and bootloader.
              </li>
              <li>
                <b>Tune</b> — the flatpak preload list is prefilled for the detected
                desktop (GNOME/KDE defaults); adjust it, the volume label, or supply a
                tbox initramfs URL under <i>Advanced</i>.
              </li>
              <li>
                <b>Build</b> — the EROFS live root, EFI system partition and
                ISO9660/El&nbsp;Torito image are authored in WASM and stream straight to
                your disk.
              </li>
            </ol>
            <p className={styles.prose} style={{marginTop: '1.5rem'}}>
              Full walkthrough with screenshots, URL parameter reference and current
              limits: <Link to="/docs/iso-builder">the ISO Builder guide</Link>. The
              engine lives in{' '}
              <Link href="https://github.com/tuna-os/tacklebox">tuna-os/tacklebox</Link>.
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
