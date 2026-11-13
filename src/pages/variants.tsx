import type {ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import Link from '@docusaurus/Link';
import {MAIN_VARIANTS, OTHER_VARIANTS, type Variant} from '@site/src/data/variants';
import {emojiMarkFor} from '@site/src/data/identity';
import BuildStreamFamily from '@site/src/components/BuildStreamFamily';

import page from '@site/src/css/page.module.css';
import styles from './variants.module.css';

function desktopList(variant: Variant): string {
  if (variant.desktops.length === 0) return 'Base image only';
  return variant.desktops.map((d) => d.name).join(' · ');
}

function MainCard({variant}: {variant: Variant}): ReactNode {
  return (
    <Link to={`/${variant.id}`} className={clsx(page.card, page.cardLinked)}>
      <div className={styles.cardHead}>
        <img className={styles.mark} src={emojiMarkFor(variant.id)} alt="" width={40} height={40} loading="lazy" />
        <Heading as="h3" className={page.cardTitle}>
          {variant.name}
        </Heading>
        {variant.recommended && <span className={page.chip}>Start here</span>}
      </div>
      <span className={styles.base}>{variant.base}</span>
      <p className={page.cardText}>{variant.blurb}</p>
      <div className={page.cardFoot}>
        <span className={styles.desktops}>{desktopList(variant)}</span>
      </div>
    </Link>
  );
}

function OtherRow({variant}: {variant: Variant}): ReactNode {
  return (
    <Link to={`/${variant.id}`} className={styles.row}>
      <span className={styles.rowName}>
        <img className={styles.rowMark} src={emojiMarkFor(variant.id)} alt="" width={22} height={22} loading="lazy" />
        {variant.name}
      </span>
      <span className={styles.rowBase}>{variant.base}</span>
      <span className={styles.rowBlurb}>{variant.blurb}</span>
      {variant.localBuildOnly && <span className={styles.rowNote}>local build only</span>}
    </Link>
  );
}

export default function Variants(): ReactNode {
  return (
    <Layout
      title="Variants"
      description="The four main TunaOS images, other distro bases, and the separately built BuildStream image family.">
      <header className={page.hero}>
        <div className={page.heroInner}>
          <span className={page.eyebrow}>Images</span>
          <Heading as="h1" className={page.heroTitle}>
            Which TunaOS image
          </Heading>
          <p className={page.heroLede}>
            The distro × desktop images are listed first. The independent BuildStream
            family follows, with its own outputs and release status.
          </p>
        </div>
      </header>

      <main>
        <section className={clsx(page.section, page.sectionFirst)}>
          <div className={page.sectionInner}>
            <div className={page.sectionHead}>
              <Heading as="h2" className={page.sectionTitle}>
                <span className={page.sectionMark}>01.</span>
                The four main images
              </Heading>
              <p className={page.sectionSub}>
                All four are bootc OCI images with live ISOs, and all four ship GNOME,
                KDE Plasma, COSMIC and Niri.
              </p>
            </div>
            <div className={clsx(page.grid, page.gridTight)}>
              {MAIN_VARIANTS.map((v) => (
                <MainCard key={v.id} variant={v} />
              ))}
            </div>
            <div className={clsx(page.btnRow, page.btnRowLeft)}>
              <Link className={clsx('button', page.btnPrimary)} to="/download">
                Download an ISO
              </Link>
              <Link className={clsx('button', page.btnGhost)} to="/matrix">
                Build matrix
              </Link>
            </div>
          </div>
        </section>

        <section className={clsx(page.section, page.sectionAlt)}>
          <div className={page.sectionInner}>
            <div className={page.sectionHead}>
              <Heading as="h2" className={page.sectionTitle}>
                <span className={page.sectionMark}>02.</span>
                Other bases
              </Heading>
              <p className={page.sectionSub}>
                The same desktop layer on other distributions, plus rolling-release
                siblings. These are separate from the BuildStream projects listed below.
              </p>
            </div>
            <div className={styles.rows}>
              {OTHER_VARIANTS.map((v) => (
                <OtherRow key={v.id} variant={v} />
              ))}
            </div>
          </div>
        </section>

        <section className={page.section}>
          <div className={page.sectionInner}>
            <div className={page.sectionHead}>
              <Heading as="h2" className={page.sectionTitle}>
                <span className={page.sectionMark}>03.</span>
                BuildStream variants
              </Heading>
              <p className={page.sectionSub}>
                Independent TunaOS image projects with their own build graphs. Athens is
                experimental and local-only; Tromsø and XFCE Linux (Brussels) declare OCI
                image references.
              </p>
            </div>
            <BuildStreamFamily />
          </div>
        </section>
      </main>
    </Layout>
  );
}
