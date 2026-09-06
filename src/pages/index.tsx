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
  {name: 'wootc', desc: 'Linux from inside Windows', to: '/wootc'},
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
              <span className={styles.grad}>Enterprise Linux</span> desktop images, built with bootc.
            </Heading>
            <div className={styles.badgeRow}>
              <span className={styles.badge}>GNOME 50</span>
              <span className={styles.badge}>AlmaLinux 10</span>
              <span className={styles.badge}>CentOS 10</span>
              <span className={styles.badge}>Fedora 44</span>
            </div>
            <p className={styles.heroLede}>
              TunaOS builds desktop images on AlmaLinux, CentOS Stream, Fedora and other
              bases, with GNOME, KDE, COSMIC, Niri or XFCE. Every image is a bootc OCI
              image: pull it, boot it, or rebase onto it.
              <br /><br />
              The org also maintains the tools that build and boot-test those images, a
              set of GTK4 applications published as Flatpaks, and RPM and DEB repositories for
              packages Enterprise Linux does not ship.
            </p>
            <div className={styles.btnGroup}>
              <Link className={clsx('button', styles.btnPrimary)} to="/download">
                Download an ISO
              </Link>
              <Link className={clsx('button', styles.btnGhost)} to="/wootc">
                Try it from Windows
              </Link>
              <Link className={clsx('button', styles.btnGhost)} to="/variants">
                Compare images
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

function InstallPathsBand(): ReactNode {
  const paths: Array<{
    icon: IconName;
    name: string;
    desc: string;
    cta: string;
    to: string;
    code?: string;
  }> = [
    {
      icon: 'shield',
      name: 'From Windows, reversibly',
      desc: 'wootc installs a real Linux desktop into a single file beside your Windows files and adds a boot entry for it. No repartitioning, and uninstalling is deleting a folder.',
      cta: 'How wootc works',
      to: '/wootc',
    },
    {
      icon: 'disc',
      name: 'From a USB stick',
      desc: 'Write a live ISO, boot it, and install. Every main image publishes one, for x86_64 and arm64.',
      cta: 'Download an ISO',
      to: '/download',
    },
    {
      icon: 'layers',
      name: 'Rebase what you run',
      desc: 'Already on bootc — Bluefin, Aurora, Fedora Atomic? Switch to a TunaOS image in one command and roll back if you do not like it.',
      cta: 'Installation docs',
      to: '/docs/installation',
      code: 'sudo bootc switch ghcr.io/tuna-os/albacore:gnome',
    },
    {
      icon: 'wrench',
      name: 'Build your own',
      desc: 'Pick an image and your flatpak set, and the browser builds the ISO locally. The same engine CI uses for release media.',
      cta: 'Open the builder',
      to: '/iso-builder',
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead
          title="Ways to install"
          sub="Four routes onto a TunaOS image. All of them end on the same bootc system, and all of them are reversible."
        />
        <div className={styles.pipelineGrid}>
          {paths.map((p, i) => (
            <Link key={p.name} to={p.to} className={styles.pipelineCard}>
              <div className={styles.cardTop}>
                <span className={styles.cardIcon}>
                  <Icon name={p.icon} size={22} />
                </span>
                <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <Heading as="h3" className={styles.cardName}>
                {p.name}
              </Heading>
              <p className={styles.cardBlurb}>{p.desc}</p>
              {p.code && (
                <code className={styles.pathCode}>{p.code}</code>
              )}
              <span className={styles.cardLink}>
                {p.cta}
                <Icon name="arrow-right" size={14} />
              </span>
            </Link>
          ))}
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
          title="What TunaOS builds"
          sub="Images, apps, and the tooling in between."
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
          title="Build pipeline"
          sub="The tools that turn a Containerfile into media: image build, boot test in a VM, ISO and USB authoring, package repositories."
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

function AppsBand(): ReactNode {
  const apps: Array<{icon: IconName; name: string; desc: string; to: string}> = [
    {
      icon: 'grid',
      name: 'GNOME office suite',
      desc: 'Letters, Tables and Decks: a GTK4 word processor, spreadsheet and presentation app written in Rust. They read DOCX, XLSX, ODS and PPTX, and export PDF.',
      to: '/office',
    },
    {
      icon: 'code',
      name: 'BlueShell and Ghostty',
      desc: 'BlueShell is a container-native terminal for GNOME built on the Ghostty engine with a Ptyxis-style interface. Upstream Ghostty is republished here unmodified and rebuilt weekly.',
      to: '/blueshell',
    },
    {
      icon: 'box',
      name: 'Mariner and Tavern',
      desc: 'Mariner is a GNOME Files alternative with typeahead, dual-pane and Quick Look. Tavern is a GTK4 front end for Homebrew on Linux.',
      to: '/tavern',
    },
    {
      icon: 'package',
      name: 'Flatpaks',
      desc: 'One remote-add makes every app above installable on any distribution that runs Flatpak. The index is rebuilt on a schedule and served from this site.',
      to: '/flatpak',
    },
  ];

  return (
    <section className={styles.section}>
      <div className="container">
        <SectionHead
          title="Applications"
          sub="GTK4 apps built in the org and published as Flatpaks. They install on any distribution that runs Flatpak, not only on TunaOS images."
        />
        <div className={styles.pipelineGrid}>
          {apps.map((a, i) => (
            <Link key={a.name} to={a.to} className={styles.pipelineCard}>
              <div className={styles.cardTop}>
                <span className={styles.cardIcon}>
                  <Icon name={a.icon} size={22} />
                </span>
                <span className={styles.cardIndex}>{String(i + 1).padStart(2, '0')}</span>
              </div>
              <Heading as="h3" className={styles.cardName}>
                {a.name}
              </Heading>
              <p className={styles.cardBlurb}>{a.desc}</p>
            </Link>
          ))}
        </div>
        <div className={styles.bandFooter}>
          <Link className={clsx('button', styles.btnGhostSmall)} to="/projects">
            All projects
          </Link>
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
              Documentation
            </Heading>
            <p className={styles.docsText}>
              Installation, image building, variant reference and troubleshooting. The
              pages are synced daily from each project&apos;s own repository, so they match
              what that project currently ships.
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
        <span className={styles.ctaKicker}>Get started</span>
        <Heading as="h2" className={styles.ctaTitle}>
          Install TunaOS
        </Heading>
        <p className={styles.ctaText}>
          Download a live ISO, or rebase an existing bootc system onto a TunaOS image.
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
      description="Enterprise Linux desktop images built with bootc, the tools that build and test them, and the GTK4 apps published as Flatpaks.">
      <Hero />
      <FinalCta />
      <Backdrop />
      <CarouselSection />
      <main>
        <InstallPathsBand />
        <HomepageFeaturesBand />
        <PipelineBand />
        <AppsBand />
        <DocsBand />
      </main>
    </Layout>
  );
}