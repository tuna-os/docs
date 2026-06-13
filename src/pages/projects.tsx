import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ProjectCards from '@site/src/components/ProjectCards';
import {BUILDSTREAM_UPSTREAMS} from '@site/src/data/projects';

import styles from './projects.module.css';

function BuildStreamFamily(): ReactNode {
  return (
    <section className={styles.bsFamily}>
      <Heading as="h2" className={styles.bsTitle}>
        🧱 BuildStream desktop family
      </Heading>
      <p className={styles.bsLede}>
        <strong>Tromsø</strong> (KDE) and <strong>XFCE Linux</strong> are built
        with <a href="https://buildstream.build">BuildStream</a> — a complete
        desktop assembled from source on freedesktop-sdk with reproducible
        pipelines, the same lineage as GNOME OS. They're associated with these
        upstream BuildStream desktop projects, each covering a different desktop:
      </p>
      <div className={styles.bsGrid}>
        {BUILDSTREAM_UPSTREAMS.map((u) => (
          <a key={u.url} href={u.url} className={styles.bsCard}>
            <span className={styles.bsBadge}>{u.desktop}</span>
            <div>
              <strong className={styles.bsName}>{u.name} ↗</strong>
              <span className={styles.bsNote}>{u.note}</span>
            </div>
          </a>
        ))}
      </div>
    </section>
  );
}

export default function Projects(): ReactNode {
  return (
    <Layout
      title="Projects"
      description="All projects in the TunaOS ecosystem — OS images, installers, ISO builders, and tooling.">
      <header className={styles.header}>
        <div className="container">
          <Heading as="h1" className={styles.title}>
            Projects
          </Heading>
          <p className={styles.subtitle}>
            Every project in the TunaOS org. From desktop OS images to
            the tools that build, install, and distribute them.
          </p>
        </div>
      </header>
      <main className="container margin-bottom--xl">
        <ProjectCards />
        <BuildStreamFamily />
      </main>
    </Layout>
  );
}
