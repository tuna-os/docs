import type {ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ProjectCards from '@site/src/components/ProjectCards';
import {BUILDSTREAM_UPSTREAMS} from '@site/src/data/projects';

import page from '@site/src/css/page.module.css';
import styles from './projects.module.css';

function BuildStreamFamily(): ReactNode {
  return (
    <section className={clsx(page.section, page.sectionAlt)}>
      <div className={page.sectionInner}>
        <div className={page.sectionHead}>
          <Heading as="h2" className={page.sectionTitle}>
            <span className={page.sectionMark}>02.</span>
            BuildStream desktop family
          </Heading>
          <p className={page.sectionSub}>
            <strong>Tromsø</strong> is the KDE counterpart to Project Bluefin&apos;s{' '}
            <strong>Dakota</strong> (GNOME) — an Aurora-style layer built with{' '}
            <a href="https://buildstream.build">BuildStream</a> on top of the vanilla
            KDE Linux base (<code>kde-build-meta</code>), just as Dakota layers on{' '}
            <code>gnome-build-meta</code>. <strong>XFCE Linux</strong> is built the same
            way. Tromsø sits alongside these sibling BuildStream desktop layers:
          </p>
        </div>
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
      </div>
    </section>
  );
}

export default function Projects(): ReactNode {
  return (
    <Layout
      title="Projects"
      description="All projects in the TunaOS ecosystem — OS images, desktop apps, installers, ISO builders, and tooling.">
      <header className={page.hero}>
        <div className={page.heroInner}>
          <span className={page.eyebrow}>tuna-os</span>
          <Heading as="h1" className={page.heroTitle}>
            Projects
          </Heading>
          <p className={page.heroLede}>
            Desktop OS images, the GTK4 apps published on the Flatpak remote, and the
            tools that build, boot-test, install and distribute them.
          </p>
        </div>
      </header>

      <main>
        <section className={clsx(page.section, page.sectionFirst)}>
          <div className={page.sectionInner}>
            <div className={page.sectionHead}>
              <Heading as="h2" className={page.sectionTitle}>
                <span className={page.sectionMark}>01.</span>
                Projects
              </Heading>
            </div>
            <ProjectCards />
          </div>
        </section>
        <BuildStreamFamily />
      </main>
    </Layout>
  );
}
