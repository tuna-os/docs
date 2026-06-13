import type {ReactNode} from 'react';
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
    <header className={styles.hero} style={style}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroEmoji}>
          <AnimatedEmoji emoji={project.emoji} size={92} />
        </div>
        <div className={styles.heroTitleRow}>
          <Heading as="h1" className={styles.heroTitle}>{project.name}</Heading>
          <span className={clsx(styles.status, styles[`status-${project.status}`])}>
            {STATUS_LABELS[project.status]}
          </span>
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
          <Link
            className={clsx('button button--lg', project.cta ? styles.btnGhost : styles.btnPrimary)}
            to={project.docs}>
            Documentation 📖
          </Link>
          <a className={clsx('button button--lg', styles.btnGhost)} href={project.repo}>
            GitHub 💻
          </a>
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
              <p className={styles.highlightText}>{h.text}</p>
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
              <p className={styles.featText}>{f.text}</p>
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
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Part of the BuildStream desktop family</Heading>
          <p>
            {project.name} is built with BuildStream — an Aurora-style layer on a vanilla
            desktop base, the same model as Project Bluefin's Dakota (GNOME). It sits
            alongside these sibling BuildStream desktop layers:
          </p>
        </div>
        <div className={styles.otherGrid}>
          {BUILDSTREAM_UPSTREAMS.map((u) => (
            <a key={u.url} href={u.url} className={styles.otherCard}>
              <span className={styles.bsDesktop}>{u.desktop}</span>
              <span>
                <strong className={styles.otherName}>{u.name} ↗</strong>
                <span className={styles.otherTagline}>{u.note}</span>
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function MoreProjects({project}: {project: Project}): ReactNode {
  const others = PROJECTS.filter((p) => p.id !== project.id);
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
      <Hero project={project} />
      <main>
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
