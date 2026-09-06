import {useEffect} from 'react';
import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import VariantCarousel from '@site/src/components/VariantCarousel';
import ProjectCarousel from '@site/src/components/ProjectCarousel';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Icon, {type IconName} from '@site/src/components/Icon';
import Heading from '@theme/Heading';

import {VARIANTS as ALL_VARIANTS} from '@site/src/data/variants';

import styles from './index.module.css';

const FEATURED_PROJECTS = [
  {name: 'TunaOS', desc: 'Desktop images', to: '/tunaos'},
  {name: 'Tacklebox', desc: 'ISO & USB builder', to: '/tacklebox'},
  {name: 'Tromsø', desc: 'KDE Linux', to: '/tromso'},
  {name: 'XFCE Linux', desc: 'XFCE desktop', to: '/xfce-linux'},
  {name: 'Tavern', desc: 'Homebrew GUI', to: '/tavern'},
  {name: 'bluefin-cli', desc: 'Shell CLI', to: '/bluefin-cli'},
  {name: 'COPR Builds', desc: 'RPM builder', to: '/copr'},
  {name: 'Corral', desc: 'VM & container manager', to: '/corral'},
  {name: 'Dakota', desc: 'Bluefin GNOME OS', to: '/dakota'},
];

type SectionHeadProps = {
  title: string;
  sub?: string;
};

function SectionHead({title, sub}: SectionHeadProps): ReactNode {
  return (
    <div className={styles.sectionHead}>
      <Heading as="h2" className={styles.sectionTitle}>
        {title}
      </Heading>
      {sub && <p className={styles.sectionSub}>{sub}</p>}
    </div>
  );
}

/**
 * Fixed art backdrop behind the hero, borrowed from the robin.tarxz.zip
 * layout: a dimmed "seascape" that the page scrolls over, with a solid
 * overlay that fades in as you scroll so the hero sinks into the page.
 */
function Backdrop(): ReactNode {
  return (
    <div className={styles.bgScene} aria-hidden>
      <div className={styles.bgImage} />
    </div>
  );
}

function Hero(): ReactNode {
  return (
    <header className={styles.hero}>
      <div className={clsx('container', styles.heroInner)}>
        <div className={styles.heroGrid}>
          <div className={styles.heroText}>
            <Heading as="h1" className={styles.heroTitle}>
              A new wave of <span className={styles.grad}>Enterprise Linux</span> desktops.
            </Heading>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>GNOME 50</span>
              <span className={styles.badge}>AlmaLinux 10</span>
              <span className={styles.badge}>CentOS 10</span>
              <span className={styles.badge}>Fedora 44</span>
            </div>
            <p className={styles.heroLede}>
              Why choose TunaOS?
              <br /><br />
              We pride ourselves on using what is proven to work, the pipeline design, CI patterns, and desktop polish this project builds on all trace back to Universal Blue and TunaOS isn't just Containerfiles — it's a small, purpose-built toolchain that builds, boots, and verifies every image before it ships.
            </p>
            <div className={styles.btnGroup}>
              <Link className={clsx('button', styles.btnPrimary)} to="/download">
                Download ISOs
              </Link>
              <Link className={clsx('button', styles.btnGhost)} to="/iso-builder">
                Build your own ISO
              </Link>
              <Link className={clsx('button', styles.btnGhost)} to="/projects">
                Explore Projects
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function CarouselSection(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.carouselGrid}>
          <div className={styles.carouselPanel}>
            <ProjectCarousel projects={FEATURED_PROJECTS} />
          </div>
          <div className={styles.carouselPanel}>
            <VariantCarousel variants={ALL_VARIANTS} />
          </div>
        </div>
      </div>
    </section>
  );
}

function HomepageFeaturesBand(): ReactNode {
  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead
          title="Built different"
          sub="A small, reproducible image factory — not a distro fork."
        />
        <HomepageFeatures />
      </div>
    </section>
  );
}

function PipelineBand(): ReactNode {
  const tools: Array<{
    icon: IconName;
    name: string;
    desc: string;
    to: string;
    external?: boolean;
  }> = [
    {
      icon: 'wrench',
      name: 'Tacklebox',
      desc: 'Turns bootc OCI images into multi-desktop, deduplicated live ISOs and installable disk images — one shared squashfs store instead of a separate ISO per desktop.',
      to: '/tacklebox',
    },
    {
      icon: 'cpu',
      name: 'Corral',
      desc: "Boots every published image in a real VM (QEMU locally, KubeVirt in CI) and checks it actually reaches a working desktop before promotion — TunaOS's boot gate.",
      to: '/corral',
    },
    {
      icon: 'package',
      name: 'tunaos-packages',
      desc: "TunaOS's package factory — builds, tests, signs, and publishes RPM and DEB repositories with GitHub Actions and Cloudflare R2 (the packages EL10 doesn't ship yet: GNOME 50, the XFCE Wayland stack).",
      to: 'https://github.com/tuna-os/tunaos-packages',
      external: true,
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead
          title="The pipeline behind every build"
          sub="TunaOS isn't just Containerfiles — it's a small, purpose-built toolchain that builds, boots, and verifies every image before it ships."
        />
        <div className={styles.pipelineGrid}>
          {tools.map((t, i) => (
            <Link
              key={t.name}
              to={t.to}
              {...(t.external ? {target: '_blank', rel: 'noopener noreferrer'} : {})}
              className={styles.pipelineCard}
            >
              <div className={styles.cardTop}>
                <span className={styles.cardIcon}>
                  <Icon name={t.icon} size={22} />
                </span>
                <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <Heading as="h3" className={styles.cardName}>
                {t.name}
                {t.external && <span className={styles.externalMark}> ↗</span>}
              </Heading>
              <p className={styles.cardBlurb}>{t.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocsBand(): ReactNode {
  return (
    <section className={clsx(styles.section, styles.docsSection)}>
      <div className="container">
        <div className={styles.docsInner}>
          <div>
            <Heading as="h2" className={styles.docsTitle}>
              Docs that live with the code
            </Heading>
            <p className={styles.docsText}>
              From first install to building your own images, the handbook covers it — and
              it’s sourced straight from the project repository, so it never drifts from
              what actually ships.
            </p>
          </div>
          <div className={styles.docsLinks}>
            <Link className={clsx('button', styles.btnPrimary)} to="/docs/intro">
              Read the Docs
            </Link>
            <a
              className={clsx('button', styles.btnGhost)}
              href="https://github.com/tuna-os/tunaOS"
            >
              Contribute on GitHub
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FinalCta(): ReactNode {
  return (
    <section className={styles.ctaBand}>
      <div className={clsx('container', styles.ctaInner)}>
        <span className={styles.ctaKicker}>Ready?</span>
        <Heading as="h2" className={styles.ctaTitle}>
          Dive in.
        </Heading>
        <p className={styles.ctaText}>
          Grab a live ISO, or rebase an existing bootc system in one command.
        </p>
        <div className={styles.btnGroup}>
          <Link className={clsx('button', styles.btnPrimary)} to="/download">
            Browse all ISOs
          </Link>
          <Link className={clsx('button', styles.btnGhost)} to="/docs/installation">
            Install Guide
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;
    const navbar = document.querySelector('.navbar');

    const update = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 0) {
        navbar?.classList.remove('navbar--hidden');
        navbar?.classList.add('navbar--visible');
      } else if (currentScrollY > lastScrollY) {
        navbar?.classList.add('navbar--hidden');
        navbar?.classList.remove('navbar--visible');
      } else {
        navbar?.classList.remove('navbar--hidden');
        navbar?.classList.add('navbar--visible');
      }
      lastScrollY = currentScrollY;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <Layout
      title={`${siteConfig.title} — Cloud-Native Enterprise Linux`}
      description="A collection of cloud-native Enterprise Linux desktop images built with bootc — Albacore, Yellowfin, Skipjack, and Bonito.">
      <Hero />
      <FinalCta />
      <Backdrop />
      <CarouselSection />
      <main>
        <HomepageFeaturesBand />
        <PipelineBand />
        <DocsBand />
      </main>
    </Layout>
  );
}