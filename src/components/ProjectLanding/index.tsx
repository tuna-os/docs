import type {ReactNode} from 'react';
import Head from '@docusaurus/Head';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import AnimatedEmoji from '@site/src/components/AnimatedEmoji';
import {PROJECTS, STATUS_LABELS, BUILDSTREAM_UPSTREAMS, type Project} from '@site/src/data/projects';

import styles from './styles.module.css';

function Hero({project}: {project: Project}): ReactNode {
  const style = {
    ['--p-accent' as string]: project.accent,
    ['--p-accent2' as string]: project.accent2,
  };
  return (
    <header className={clsx(styles.hero, project.heroEmojiLarge && styles.heroLargeEmoji)} style={style}>
      {project.heroEmojiLarge && (
        <div className={styles.heroBgEmoji} aria-hidden>
          <AnimatedEmoji emoji={project.emoji} size={420} speed={0.4} />
        </div>
      )}
      <div className={clsx('container', styles.heroInner)}>
        {project.logo ? (
          <img src={project.logo} alt={project.name} className={clsx(styles.heroLogo, project.logoLight && styles.heroLogoLight)} />
        ) : !project.heroEmojiLarge ? (
          <div className={styles.heroEmoji}>
            <AnimatedEmoji emoji={project.emoji} size={92} />
          </div>
        ) : null}
        <div className={styles.heroTitleRow}>
          <Heading as="h1" className={styles.heroTitle}>{project.name}</Heading>
          <span className={clsx(styles.status, styles[`status-${project.status}`])}>
            {STATUS_LABELS[project.status]}
          </span>
          {project.external && <span className={styles.externalBadge}>External</span>}
        </div>
        <p className={styles.heroTagline}>{project.tagline}</p>
        <p className={styles.heroLede}>{project.lede}</p>

        {project.stats && (
          <div className={styles.statRow}>
            {project.stats.map((s) => (
              <div key={s.label} className={styles.statChip}>
                <span className={styles.statValue}>{s.value}</span>
                <span className={styles.statLabel}>{s.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className={styles.heroButtons}>
          {project.cta && (
            <Link className={clsx('button button--lg', styles.btnPrimary)} to={project.cta.to}>
              {project.cta.label}
            </Link>
          )}
          {project.flathub && (
            <a className={clsx('button button--lg', styles.btnPrimary)} href={`/install?app=${project.flathub}`}>
              Install 📦
            </a>
          )}
          {project.flatpakRust && (
            <a className={clsx('button button--lg', styles.btnGhost)} href={`/install?app=${project.flatpakRust}`}>
              Install (Rust) 🦀
            </a>
          )}
          {project.docs && (
            <Link
              className={clsx('button button--lg', project.cta ? styles.btnGhost : styles.btnPrimary)}
              to={project.docs}>
              Documentation 📖
            </Link>
          )}
          {project.external ? (
            <a className={clsx('button button--lg', project.cta || project.docs ? styles.btnGhost : styles.btnPrimary)} href={project.externalLink || project.repo}>
              View on GitHub 💻
            </a>
          ) : (
            <a className={clsx('button button--lg', styles.btnGhost)} href={project.repo}>
              GitHub 💻
            </a>
          )}
        </div>
      </div>
    </header>
  );
}

function Screenshots({project}: {project: Project}): ReactNode {
  if (!project.screenshots?.length) return null;
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">See it in action</Heading>
        </div>
        <div className={styles.shotGrid}>
          {project.screenshots.map((s) => (
            <figure key={s.src} className={styles.shot}>
              <img src={s.src} alt={s.alt} loading="lazy" />
              <figcaption>{s.alt}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function Highlights({project}: {project: Project}): ReactNode {
  if (!project.highlights?.length) return null;
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.highlightGrid}>
          {project.highlights.map((h) => (
            <div key={h.title} className={styles.highlightCard}>
              <Heading as="h3" className={styles.highlightTitle}>{h.title}</Heading>
              <p className={styles.highlightText} dangerouslySetInnerHTML={{__html: h.text}} />
            </div>
          ))}
        </div>
        <div className={styles.alphaNote}>
          <span>⚠️</span> Alpha. Take appropriate precautions.
        </div>
      </div>
    </section>
  );
}

function Features({project}: {project: Project}): ReactNode {
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Features</Heading>
        </div>
        <div className={styles.featGrid}>
          {project.features.map((f) => (
            <div key={f.title} className={styles.featCard}>
              <span className={styles.featEmoji}><AnimatedEmoji emoji={f.emoji} size={30} /></span>
              <Heading as="h3" className={styles.featTitle}>{f.title}</Heading>
              <p className={styles.featText} dangerouslySetInnerHTML={{__html: f.text}} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Install({project}: {project: Project}): ReactNode {
  if (!project.install?.length) return null;
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Get started</Heading>
        </div>
        <div className={styles.installList}>
          {project.install.map((i) => (
            <div key={i.label} className={styles.installItem}>
              <span className={styles.installLabel}>{i.label}</span>
              <pre className={styles.installCode}><code>{i.code}</code></pre>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function BuildStreamFamily({project}: {project: Project}): ReactNode {
  if (!project.buildstream) return null;
  const siblings = BUILDSTREAM_UPSTREAMS.filter((u) => u.name !== project.name);
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Part of the BuildStream desktop family</Heading>
          <p>
            {project.name} is built with{' '}
            <a href="https://buildstream.build" target="_blank">BuildStream</a> on{' '}
            <a href="https://gitlab.com/freedesktop-sdk/freedesktop-sdk" target="_blank">freedesktop-sdk</a> —
            the same foundation as GNOME OS. These sibling projects share the same
            build system and base:
          </p>
        </div>
        <div className={styles.otherGrid}>
          {siblings.map((u) => (
            <Link key={u.url} to={u.url} className={styles.otherCard}>
              <span className={styles.otherEmoji}>
                <AnimatedEmoji emoji={u.emoji} size={30} />
              </span>
              <span>
                <strong className={styles.otherName}>{u.name}</strong>
                <span className={styles.otherTagline}>{u.note}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function MoreProjects({project}: {project: Project}): ReactNode {
  const others = PROJECTS.filter((p) => p.id !== project.id && !p.external);
  return (
    <section className={clsx(styles.section, styles.sectionAlt)}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">More from TunaOS</Heading>
        </div>
        <div className={styles.otherGrid}>
          {others.map((p) => (
            <Link key={p.id} to={`/${p.id}`} className={styles.otherCard}>
              <span className={styles.otherEmoji}><AnimatedEmoji emoji={p.emoji} size={30} /></span>
              <span>
                <strong className={styles.otherName}>{p.name}</strong>
                <span className={styles.otherTagline}>{p.tagline}</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="text--center margin-top--md">
          <Link className="button button--outline button--md" to="/projects">
            All projects →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function ProjectLanding({project}: {project: Project}): ReactNode {
  return (
    <Layout title={project.name} description={project.tagline}>
      <Head>
        <meta property="og:title" content={`${project.name} — TunaOS`} />
        <meta property="og:description" content={project.tagline} />
        <meta property="og:image" content="https://tunaos.org/img/tunaos-social-card.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${project.name} — TunaOS`} />
        <meta name="twitter:description" content={project.tagline} />
        <meta name="twitter:image" content="https://tunaos.org/img/tunaos-social-card.png" />
      </Head>
      <Hero project={project} />
      <main className={project.id === 'tromso' ? 'aurora-page' : undefined}>
        <Highlights project={project} />
        <Screenshots project={project} />
        <Features project={project} />
        <Install project={project} />
        <BuildStreamFamily project={project} />
        <MoreProjects project={project} />
      </main>
    </Layout>
  );
}
