import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import HeroGraphics from '@site/src/components/HeroGraphics';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <Heading as="h1" className="hero__title">
              🐟 {siteConfig.title}
            </Heading>
            <p className="hero__subtitle">{siteConfig.tagline}</p>
            <p className={styles.heroDescription}>
              Specialized forks of <a href="https://github.com/ublue-os/bluefin-lts" target="_blank">Bluefin LTS</a> based 
              on AlmaLinux 10, AlmaLinux Kitten 10, CentOS 10, and Fedora
            </p>
            <div className={styles.buttons}>
              <Link
                className="button button--secondary button--lg"
                to="docs/intro">
                Get Started 🚀
              </Link>
              <Link
                className="button button--outline button--lg"
                to="docs/installation">
                Download ISOs 📦
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function DownloadSection() {
  return (
    <section className={styles.downloadSection}>
      <div className="container">
        <div className="text--center margin-bottom--lg">
          <Heading as="h2">Download TunaOS Images</Heading>
          <p>Choose your preferred variant and architecture</p>
        </div>
        <div className="row">
          <div className="col col--6">
            <div className={styles.variantCard}>
              <h3>🐟 Albacore (AlmaLinux 10)</h3>
              <p>Stable enterprise-grade desktop experience</p>
              <div className={styles.downloadLinks}>
                <h4>Regular Edition</h4>
                <div className={styles.archLinks}>
                  <a href="https://download.tunaos.org/albacore-amd64.iso" className="button button--primary button--sm">x86_64</a>
                  <a href="https://download.tunaos.org/albacore-amd64-v2.iso" className="button button--primary button--sm">x86_64_v2</a>
                  <a href="https://download.tunaos.org/albacore-arm64.iso" className="button button--primary button--sm">ARM64</a>
                </div>
                <h4>DX (Developer)</h4>
                <div className={styles.archLinks}>
                  <a href="https://download.tunaos.org/albacore-dx-amd64.iso" className="button button--secondary button--sm">x86_64</a>
                  <a href="https://download.tunaos.org/albacore-dx-amd64-v2.iso" className="button button--secondary button--sm">x86_64_v2</a>
                  <a href="https://download.tunaos.org/albacore-dx-arm64.iso" className="button button--secondary button--sm">ARM64</a>
                </div>
                <h4>GDX (Graphics/AI)</h4>
                <div className={styles.archLinks}>
                  <a href="https://download.tunaos.org/albacore-gdx-amd64.iso" className="button button--outline button--sm">x86_64</a>
                  <a href="https://download.tunaos.org/albacore-gdx-amd64-v2.iso" className="button button--outline button--sm">x86_64_v2</a>
                  <a href="https://download.tunaos.org/albacore-gdx-arm64.iso" className="button button--outline button--sm">ARM64</a>
                </div>
              </div>
            </div>
          </div>
          <div className="col col--6">
            <div className={styles.variantCard}>
              <h3>🐠 Yellowfin (AlmaLinux Kitten 10)</h3>
              <p>Closest to upstream Bluefin LTS experience</p>
              <div className={styles.downloadLinks}>
                <h4>Regular Edition</h4>
                <div className={styles.archLinks}>
                  <a href="https://download.tunaos.org/yellowfin-amd64.iso" className="button button--primary button--sm">x86_64</a>
                  <a href="https://download.tunaos.org/yellowfin-amd64-v2.iso" className="button button--primary button--sm">x86_64_v2</a>
                  <a href="https://download.tunaos.org/yellowfin-arm64.iso" className="button button--primary button--sm">ARM64</a>
                </div>
                <h4>DX (Developer)</h4>
                <div className={styles.archLinks}>
                  <a href="https://download.tunaos.org/yellowfin-dx-amd64.iso" className="button button--secondary button--sm">x86_64</a>
                  <a href="https://download.tunaos.org/yellowfin-dx-amd64-v2.iso" className="button button--secondary button--sm">x86_64_v2</a>
                  <a href="https://download.tunaos.org/yellowfin-dx-arm64.iso" className="button button--secondary button--sm">ARM64</a>
                </div>
                <h4>GDX (Graphics/AI)</h4>
                <div className={styles.archLinks}>
                  <a href="https://download.tunaos.org/yellowfin-gdx-amd64.iso" className="button button--outline button--sm">x86_64</a>
                  <a href="https://download.tunaos.org/yellowfin-gdx-amd64-v2.iso" className="button button--outline button--sm">x86_64_v2</a>
                  <a href="https://download.tunaos.org/yellowfin-gdx-arm64.iso" className="button button--outline button--sm">ARM64</a>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row margin-top--lg">
          <div className="col col--6">
            <div className={clsx(styles.variantCard, styles.devCard)}>
              <h3>🎣 Bonito (Fedora 42)</h3>
              <p>Cutting-edge experience (Development)</p>
              <p className={styles.devNote}>
                <strong>Status:</strong> Under development - check back soon!
              </p>
            </div>
          </div>
          <div className="col col--6">
            <div className={clsx(styles.variantCard, styles.devCard)}>
              <h3>🍣 Skipjack (CentOS 10)</h3>
              <p>CentOS-based variant (Development)</p>
              <p className={styles.devNote}>
                <strong>Status:</strong> Under development - check back soon!
              </p>
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
        <HeroGraphics />
        <HomepageFeatures />
        <DownloadSection />
      </main>
    </Layout>
  );
}
