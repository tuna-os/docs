import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className="badge badge--secondary margin-bottom--md">GNOME 48.3 • AlmaLinux 10 • CentOS 10</div>
            <Heading as="h1" className="hero__title">
              🐟 {siteConfig.title}
            </Heading>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <p className={styles.heroDescription}>
              Modern, cloud-native desktop images based on Enterprise Linux. 
              Built with <a href="https://github.com/bootc-dev/bootc" target="_blank">bootc</a> technology 
              for unparalleled reliability and flexibility.
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--secondary button--lg"
                to="docs/intro">
                Get Started 🚀
              </Link>
              <Link
                className="button button--outline button--lg"
                to="#download">
                Download ISOs 📦
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function WhySection() {
  return (
    <section className={styles.whySection}>
      <div className="container">
        <div className="text--center">
          <Heading as="h2">Why TunaOS?</Heading>
          <p>The stability of Enterprise Linux with the freshness of a modern desktop.</p>
        </div>
        <div className={styles.whyGrid}>
          <div className={styles.whyItem}>
            <Heading as="h3">🛡️ Rock Solid</Heading>
            <p>Built on AlmaLinux 10 and CentOS 10. Get 10 years of updates and enterprise-grade stability for your workstation.</p>
          </div>
          <div className={styles.whyItem}>
            <Heading as="h3">⚡ Modern Desktop</Heading>
            <p>We backport GNOME 48.3 and other modern desktop components that are usually years away for Enterprise Linux users.</p>
          </div>
          <div className={styles.whyItem}>
            <Heading as="h3">🔧 Developer First</Heading>
            <p>Homebrew baked-in, Flathub enabled, and specialized DX/GDX images for developers and AI researchers.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function DownloadSection() {
  return (
    <section id="download" className={styles.downloadSection}>
      <div className="container">
        <div className="text--center margin-bottom--lg">
          <Heading as="h2">Download TunaOS</Heading>
          <p>Select your variant and architecture to get started</p>
        </div>
        
        <div className="row">
          {/* Albacore - Flagship */}
          <div className="col col--6">
            <div className={clsx(styles.variantCard, styles.flagshipCard)}>
              <div className={styles.flagshipBadge}>Flagship</div>
              <h3>🐟 Albacore (AlmaLinux 10)</h3>
              <p>The stable, recommended choice for most users. Balanced, reliable, and ready for work.</p>
              
              <div className={styles.downloadGroup}>
                <h4>Regular Edition</h4>
                <div className={styles.archLinks}>
                  <a href="https://download.tunaos.org/albacore-amd64.iso" className="button button--primary button--sm">x86_64</a>
                  <a href="https://download.tunaos.org/albacore-amd64-v2.iso" className="button button--primary button--sm">x86_64_v2</a>
                  <a href="https://download.tunaos.org/albacore-arm64.iso" className="button button--primary button--sm">ARM64</a>
                </div>
              </div>
              
              <div className={styles.downloadGroup}>
                <h4>Desktop Flavors</h4>
                <div className={styles.archLinks}>
                  <Link to="docs/albacore#kde" className="button button--outline button--sm">KDE Plasma</Link>
                  <Link to="docs/albacore#cosmic" className="button button--outline button--sm">COSMIC</Link>
                  <Link to="docs/albacore#niri" className="button button--outline button--sm">Niri</Link>
                  <Link to="docs/albacore#gnome50" className="button button--outline button--sm">GNOME 50</Link>
                </div>
              </div>

              <div className={styles.downloadGroup}>
                <h4>Specialized Editions</h4>
                <div className={styles.archLinks}>
                  <Link to="docs/albacore#dx" className="button button--outline button--sm">Developer (DX)</Link>
                  <Link to="docs/albacore#gdx" className="button button--outline button--sm">Graphics/AI (GDX)</Link>
                  <Link to="docs/albacore#hwe" className="button button--secondary button--sm">New Hardware (HWE)</Link>
                </div>
              </div>
            </div>
          </div>

          {/* Yellowfin */}
          <div className="col col--6">
            <div className={styles.variantCard}>
              <h3>🐠 Yellowfin (AlmaLinux Kitten)</h3>
              <p>The "daily driver" variant. Closest to upstream Bluefin LTS and often receives features first.</p>
              
              <div className={styles.downloadGroup}>
                <h4>Regular Edition</h4>
                <div className={styles.archLinks}>
                  <a href="https://download.tunaos.org/yellowfin-amd64.iso" className="button button--primary button--sm">x86_64</a>
                  <a href="https://download.tunaos.org/yellowfin-amd64-v2.iso" className="button button--primary button--sm">x86_64_v2</a>
                  <a href="https://download.tunaos.org/yellowfin-arm64.iso" className="button button--primary button--sm">ARM64</a>
                </div>
              </div>

              <div className={styles.downloadGroup}>
                <h4>Desktop Flavors</h4>
                <div className={styles.archLinks}>
                  <Link to="docs/yellowfin#kde" className="button button--outline button--sm">KDE Plasma</Link>
                  <Link to="docs/yellowfin#cosmic" className="button button--outline button--sm">COSMIC</Link>
                  <Link to="docs/yellowfin#niri" className="button button--outline button--sm">Niri</Link>
                  <Link to="docs/yellowfin#gnome50" className="button button--outline button--sm">GNOME 50</Link>
                </div>
              </div>

              <div className={styles.downloadGroup}>
                <h4>Specialized Editions</h4>
                <div className={styles.archLinks}>
                  <Link to="docs/yellowfin#dx" className="button button--outline button--sm">Developer (DX)</Link>
                  <Link to="docs/yellowfin#gdx" className="button button--outline button--sm">Graphics/AI (GDX)</Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row margin-top--lg">
          {/* Skipjack */}
          <div className="col col--6">
            <div className={clsx(styles.variantCard, styles.devCard)}>
              <h3>🍣 Skipjack (CentOS 10)</h3>
              <p>The upstream-tracking variant based on CentOS Stream 10. For those who want the future of EL today.</p>
              <div className={styles.devNote}>
                <strong>Status:</strong> Active development • <Link to="docs/skipjack">Learn more</Link>
              </div>
            </div>
          </div>

          {/* Bonito */}
          <div className="col col--6">
            <div className={clsx(styles.variantCard, styles.devCard)}>
              <h3>🎣 Bonito (Fedora 42)</h3>
              <p>The cutting-edge variant for those who want the absolute latest packages and kernels.</p>
              <div className={styles.devNote}>
                <strong>Status:</strong> Experimental • <Link to="docs/bonito">Learn more</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Cloud-Native Enterprise Linux`}
      description="A collection of cloud-native Enterprise Linux OS images based on Bluefin LTS">
      <HomepageHeader />
      <main>
        <WhySection />
        <HomepageFeatures />
        <DownloadSection />
      </main>
    </Layout>
  );
}
