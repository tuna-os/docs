import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import ImagePicker from '@site/src/components/ImagePicker';
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
          <Heading as="h2">Find Your Image</Heading>
          <p>Answer a few questions and we'll point you to the right TunaOS image.</p>
        </div>
        <ImagePicker />
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
