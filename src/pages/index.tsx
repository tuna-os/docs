import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import AnimatedEmoji from '@site/src/components/AnimatedEmoji';
import Heading from '@theme/Heading';

import styles from './index.module.css';

const VARIANTS = [
  {
    emoji: '🐟',
    name: 'Albacore',
    base: 'AlmaLinux 10',
    blurb: '10-year support cycle. The rock-solid daily driver for work.',
    to: '/albacore',
    flagship: true,
  },
  {
    emoji: '🐠',
    name: 'Yellowfin',
    base: 'AlmaLinux Kitten',
    blurb: 'Newer packages on a near-enterprise base. The developer pick.',
    to: '/yellowfin',
  },
  {
    emoji: '🍣',
    name: 'Skipjack',
    base: 'CentOS Stream 10',
    blurb: 'Upstream-tracking — a preview of where Enterprise Linux is headed.',
    to: '/skipjack',
  },
  {
    emoji: '🎣',
    name: 'Bonito',
    base: 'Fedora 44',
    blurb: 'Bleeding-edge packages and the very latest kernel.',
    to: '/bonito',
  },
];

function Hero(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroBubbles} aria-hidden>
        {Array.from({length: 12}).map((_, i) => (
          <span key={i} className={styles.bubble} />
        ))}
      </div>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.badgeRow}>
          <span className={styles.badge}>GNOME 50</span>
          <span className={styles.badge}>AlmaLinux 10</span>
          <span className={styles.badge}>CentOS 10</span>
          <span className={styles.badge}>Fedora 44</span>
        </div>
        <Heading as="h1" className={styles.heroTitle}>
          <span className={styles.heroFish}><AnimatedEmoji emoji="🐟" size={64} /></span> {siteConfig.title}
        </Heading>
        <p className={styles.heroTagline}>{siteConfig.tagline}</p>
        <p className={styles.heroLede}>
          Modern, cloud-native desktops with the stability of Enterprise Linux.
          Built on{' '}
          <a href="https://github.com/bootc-dev/bootc" target="_blank" rel="noreferrer">
            bootc
          </a>{' '}
          for atomic updates, painless rollbacks, and effortless customization.
        </p>
        <div className={styles.heroButtons}>
          <Link className={clsx('button button--lg', styles.btnPrimary)} to="/download">
            Download ISOs 📦
          </Link>
          <Link className={clsx('button button--lg', styles.btnGhost)} to="/iso-builder">
            Build your own ISO 🛠️
          </Link>
          <Link className={clsx('button button--lg', styles.btnGhost)} to="/projects">
            Explore Projects 🚀
          </Link>
        </div>
      </div>
    </header>
  );
}

function VariantLineup(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Pick your fish</Heading>
          <p>Four bases, one experience — same desktop, different release cadence.</p>
        </div>
        <div className={styles.variantGrid}>
          {VARIANTS.map((v) => (
            <Link
              key={v.name}
              to={v.to}
              className={clsx(styles.variantCard, {[styles.variantFlagship]: v.flagship})}
            >
              {v.flagship && <span className={styles.flagshipTag}>Recommended</span>}
              <div className={styles.variantEmoji}><AnimatedEmoji emoji={v.emoji} size={40} /></div>
              <Heading as="h3" className={styles.variantName}>
                {v.name}
              </Heading>
              <div className={styles.variantBase}>{v.base}</div>
              <p className={styles.variantBlurb}>{v.blurb}</p>
              <span className={styles.variantLink}>Learn more →</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocsBand(): ReactNode {
  return (
    <section className={clsx(styles.section, styles.devBand)}>
      <div className="container">
        <div className={styles.devInner}>
          <div>
            <Heading as="h2">Docs that live with the code</Heading>
            <p className={styles.devText}>
              From first install to building your own images, the handbook
              covers it — and it’s sourced straight from the project repository,
              so it never drifts from what actually ships.
            </p>
          </div>
          <div className={styles.devLinks}>
            <Link className="button button--primary button--lg" to="/docs/intro">
              📖 Read the Docs
            </Link>
            <a
              className="button button--outline button--lg"
              href="https://github.com/tuna-os/tunaOS"
            >
              💻 Contribute on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function ProjectsBand(): ReactNode {
  const featured = [
    {emoji: '🐟', name: 'TunaOS', desc: 'Desktop images', to: '/tunaos'},
    {emoji: '🛠', name: 'Tacklebox', desc: 'ISO & USB builder', to: '/tacklebox'},
    {emoji: '🌌', name: 'Tromsø', desc: 'KDE Linux', to: '/tromso'},
    {emoji: '🖥️', name: 'XFCE Linux', desc: 'XFCE desktop', to: '/xfce-linux'},
    {emoji: '🍻', name: 'Tavern', desc: 'Homebrew GUI', to: '/tavern'},
    {emoji: '⌨️', name: 'bluefin-cli', desc: 'Shell CLI', to: '/bluefin-cli'},
    {emoji: '⚙', name: 'COPR Builds', desc: 'RPM builder', to: '/copr'},
    {emoji: '🤠', name: 'Corral', desc: 'VM & container manager', to: '/corral'},
    {emoji: '🦖', name: 'Dakota', desc: 'Bluefin GNOME OS', to: '/dakota'},
  ];
  return (
    <section className={clsx(styles.section)}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">Our projects</Heading>
          <p>Tools, installers, and ISOs — everything we build.</p>
        </div>
        <div className={styles.projectGrid}>
          {featured.map((p) => (
            <Link key={p.name} to={p.to} className={styles.projectChip}>
              <span className={styles.projectChipEmoji}><AnimatedEmoji emoji={p.emoji} size={24} /></span>
              <span>
                <strong>{p.name}</strong>
                <span className={styles.projectChipDesc}> — {p.desc}</span>
              </span>
            </Link>
          ))}
        </div>
        <div className="text--center margin-top--md">
          <Link className="button button--outline button--md" to="/projects">
            Explore all projects →
          </Link>
        </div>
      </div>
    </section>
  );
}

function PipelineBand(): ReactNode {
  const tools = [
    {
      emoji: '🛠',
      name: 'Tacklebox',
      desc: 'Turns bootc OCI images into multi-desktop, deduplicated live ISOs and installable disk images — one shared squashfs store instead of a separate ISO per desktop.',
      to: '/tacklebox',
    },
    {
      emoji: '🤠',
      name: 'Corral',
      desc: "Boots every published image in a real VM (QEMU locally, KubeVirt in CI) and checks it actually reaches a working desktop before promotion — TunaOS's boot gate.",
      to: '/corral',
    },
    {
      emoji: '⚙',
      name: 'github-copr',
      desc: 'A self-hosted, mock-based RPM build system with GitHub Actions and Cloudflare R2 — builds the packages EL10 doesn’t ship yet (GNOME 50, the XFCE Wayland stack) and its apt-world sibling debian-copr.',
      to: 'https://github.com/tuna-os/github-copr',
      external: true,
    },
  ];

  return (
    <section className={clsx(styles.section, styles.pipelineSection)}>
      <div className="container">
        <div className={styles.sectionHead}>
          <Heading as="h2">The pipeline behind every build</Heading>
          <p>
            TunaOS isn't just Containerfiles — it's a small, purpose-built toolchain that
            builds, boots, and verifies every image before it ships.
          </p>
        </div>
        <div className={styles.pipelineGrid}>
          {tools.map((t) => (
            <Link
              key={t.name}
              to={t.to}
              {...(t.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
              className={styles.pipelineCard}>
              <div className={styles.pipelineCardHead}>
                <span className={styles.projectChipEmoji}><AnimatedEmoji emoji={t.emoji} size={28} /></span>
                <strong>{t.name}{t.external ? ' ↗' : ''}</strong>
              </div>
              <p>{t.desc}</p>
            </Link>
          ))}
        </div>

        <div className={styles.foundationNote}>
          <Heading as="h3">Built on a proven foundation</Heading>
          <p>
            TunaOS is a fork of{' '}
            <a href="https://github.com/ublue-os/bluefin-lts" target="_blank" rel="noopener noreferrer">
              Bluefin LTS
            </a>{' '}
            — itself part of the{' '}
            <a href="https://github.com/ublue-os/bluefin" target="_blank" rel="noopener noreferrer">
              Bluefin
            </a>{' '}
            /{' '}
            <a href="https://github.com/ublue-os/aurora" target="_blank" rel="noopener noreferrer">
              Aurora
            </a>{' '}
            family from Universal Blue — the pipeline design, CI patterns, and desktop
            polish this project builds on all trace back there, adapted for Enterprise Linux
            and, now, Ubuntu.
          </p>
        </div>
      </div>
    </section>
  );
}

function FinalCta(): ReactNode {
  return (
    <section className={styles.ctaBand}>
      <div className="container text--center">
        <Heading as="h2" className={styles.ctaTitle}>
          Ready to dive in?
        </Heading>
        <p className={styles.ctaText}>
          Grab a live ISO, or rebase an existing bootc system in one command.
        </p>
        <div className={styles.heroButtons}>
          <Link className={clsx('button button--lg', styles.btnPrimary)} to="/download">
            Browse all ISOs 📦
          </Link>
          <Link className={clsx('button button--lg', styles.btnGhost)} to="/docs/installation">
            Install Guide 📋
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} — Cloud-Native Enterprise Linux`}
      description="A collection of cloud-native Enterprise Linux desktop images built with bootc — Albacore, Yellowfin, Skipjack, and Bonito.">
      <Hero />
      <main>
        <VariantLineup />
        <ProjectsBand />
        <HomepageFeatures />
        <DocsBand />
        <FinalCta />
      </main>
    </Layout>
  );
}
