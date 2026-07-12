import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import AnimatedEmoji from '@site/src/components/AnimatedEmoji';
import DesktopScreenshots from '@site/src/components/DesktopScreenshots';
import {VARIANTS, type Variant} from '@site/src/data/variants';
import useIsoNames from '@site/src/hooks/useIsoNames';
import {ISO_BASE_URL, isoNameForImage} from '@site/src/utils/isoNaming';

import styles from './styles.module.css';

function Hero({variant, isoNames}: {variant: Variant; isoNames: Set<string> | null}): ReactNode {
  // Per-variant accent gradient, injected as CSS custom properties.
  const style = {
    ['--v-accent' as string]: variant.accent,
    ['--v-accent2' as string]: variant.accent2,
  };
  // Prefer a direct link to the flagship flavor's live ISO; fall back to the
  // picker page if nothing's published yet (or the index hasn't loaded).
  const heroFlavor = variant.flavors.find(
    (f) => isoNames && isoNames.has(isoNameForImage(variant.id, f.image) ?? ''),
  );
  const heroIsoUrl = heroFlavor ? `${ISO_BASE_URL}/${isoNameForImage(variant.id, heroFlavor.image)}.iso` : null;
  return (
    <header className={styles.hero} style={style}>
      <div className={styles.heroBubbles} aria-hidden>
        {Array.from({length: 14}).map((_, i) => (
          <span key={i} className={styles.bubble} />
        ))}
      </div>
      <div className={clsx('container', styles.heroInner)}>
        {variant.recommended && <span className={styles.recommendedTag}>★ Recommended</span>}
        <div className={styles.heroEmoji}>
          <AnimatedEmoji emoji={variant.emoji} size={104} />
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          {variant.name}
        </Heading>
        <a className={styles.heroBase} href={variant.baseUrl} target="_blank" rel="noreferrer">
          Based on {variant.base} ↗
        </a>
        <p className={styles.heroLede}>{variant.lede}</p>

        <div className={styles.statRow}>
          {variant.stats.map((s) => (
            <div key={s.label} className={styles.statChip}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.heroButtons}>
          {heroIsoUrl ? (
            <a className={clsx('button button--lg', styles.btnPrimary)} href={heroIsoUrl}>
              Download ISO 📦
            </a>
          ) : (
            <Link className={clsx('button button--lg', styles.btnPrimary)} to="/download">
              Browse images 📦
            </Link>
          )}
          <Link className={clsx('button button--lg', styles.btnGhost)} to={`/docs/${variant.id}`}>
            Full docs 📖
          </Link>
        </div>
      </div>
    </header>
  );
}

function Desktops({variant}: {variant: Variant}): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">One base, every desktop</Heading>
          <p>Each {variant.name} flavor ships a different desktop on the same {variant.base} foundation.</p>
        </div>
        <div className={styles.deskGrid}>
          {variant.desktops.map((d) => (
            <div key={d.tag} className={styles.deskCard}>
              <span className={styles.deskEmoji}><AnimatedEmoji emoji={d.emoji} size={36} /></span>
              <Heading as="h3" className={styles.deskName}>{d.name}</Heading>
              <p className={styles.deskBlurb}>{d.blurb}</p>
              <code className={styles.deskTag}>:{d.tag}</code>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Features({variant}: {variant: Variant}): ReactNode {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Why {variant.name}</Heading>
        </div>
        <div className={styles.featGrid}>
          {variant.features.map((f) => (
            <div key={f.title} className={styles.featCard}>
              <span className={styles.featEmoji}><AnimatedEmoji emoji={f.emoji} size={32} /></span>
              <Heading as="h3" className={styles.featTitle}>{f.title}</Heading>
              <p className={styles.featText}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Flavors({variant, isoNames}: {variant: Variant; isoNames: Set<string> | null}): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Images & flavors</Heading>
          <p>Pull any flavor directly, or grab a live ISO where one's published.</p>
        </div>
        <div className={styles.flavorTable}>
          {variant.flavors.map((f) => {
            const isoName = isoNameForImage(variant.id, f.image);
            const isoUrl = isoName && isoNames?.has(isoName) ? `${ISO_BASE_URL}/${isoName}.iso` : null;
            return (
              <div key={f.image} className={styles.flavorRow}>
                <span className={styles.flavorName}>
                  {f.name}
                  {f.note && <span className={styles.flavorNote}>{f.note}</span>}
                </span>
                <code className={styles.flavorImage}>{f.image}</code>
                {isoUrl && (
                  <a
                    href={isoUrl}
                    className={clsx('button button--sm button--primary', styles.flavorDownload)}
                  >
                    ⬇️ ISO
                  </a>
                )}
              </div>
            );
          })}
        </div>
        <div className={styles.rebaseBox}>
          <span className={styles.rebaseLabel}>Rebase an existing bootc system</span>
          <pre className={styles.rebaseCode}>
            <code>{`sudo bootc switch ${variant.flavors[0].image}`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
}

function OtherVariants({variant}: {variant: Variant}): ReactNode {
  const others = VARIANTS.filter((v) => v.id !== variant.id);
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Prefer a different cadence?</Heading>
          <p>Same desktops, same tooling — pick the base that fits you.</p>
        </div>
        <div className={styles.otherGrid}>
          {others.map((v) => (
            <Link key={v.id} to={`/${v.id}`} className={styles.otherCard}>
              <span className={styles.otherEmoji}><AnimatedEmoji emoji={v.emoji} size={34} /></span>
              <div>
                <strong className={styles.otherName}>{v.name}</strong>
                <span className={styles.otherBase}>{v.base}</span>
                <span className={styles.otherBlurb}>{v.blurb}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta({variant}: {variant: Variant}): ReactNode {
  const style = {
    ['--v-accent' as string]: variant.accent,
    ['--v-accent2' as string]: variant.accent2,
  };
  return (
    <section className={styles.ctaBand} style={style}>
      <div className="container text--center">
        <div className={styles.ctaEmoji}><AnimatedEmoji emoji={variant.emoji} size={56} /></div>
        <Heading as="h2" className={styles.ctaTitle}>Dive into {variant.name}</Heading>
        <p className={styles.ctaText}>
          Grab a live ISO, or rebase an existing bootc system in one command.
        </p>
        <div className={styles.heroButtons}>
          <Link className={clsx('button button--lg', styles.btnPrimary)} to="/download">
            Download 📦
          </Link>
          <Link className={clsx('button button--lg', styles.btnGhost)} to="/docs/installation">
            Install guide 📋
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function VariantLanding({variant}: {variant: Variant}): ReactNode {
  const isoNames = useIsoNames();
  return (
    <Layout
      title={`${variant.name} — ${variant.base}`}
      description={variant.blurb}>
      <Hero variant={variant} isoNames={isoNames} />
      <main>
        <Desktops variant={variant} />
        <DesktopScreenshots variant={variant.id} desktops={variant.desktops} />
        <Features variant={variant} />
        <Flavors variant={variant} isoNames={isoNames} />
        <OtherVariants variant={variant} />
        <Cta variant={variant} />
      </main>
    </Layout>
  );
}
