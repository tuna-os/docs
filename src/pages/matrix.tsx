import type {ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import BuildMatrix from '@site/src/components/BuildMatrix';

import styles from '@site/src/css/page.module.css';

export default function Matrix(): ReactNode {
  return (
    <Layout
      title="Build Matrix"
      description="Every TunaOS variant and desktop, at a glance — what's built, what has a live ISO, and what's still coming.">
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Build matrix</span>
          <Heading as="h1" className={styles.heroTitle}>
            Build matrix
          </Heading>
          <p className={styles.heroLede}>
            What is built and published today — derived from the same data that drives
            each variant&apos;s own page, so it cannot drift out of sync.{' '}
            <strong>ISO</strong> means a live installable image ships; otherwise it is
            an OCI image you can rebase onto.
          </p>
        </div>
      </header>
      <main className={clsx(styles.section, styles.sectionFirst)}>
        <div className={styles.sectionInner}>
          <BuildMatrix />
        </div>
      </main>
    </Layout>
  );
}
