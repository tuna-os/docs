import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ProjectCards from '@site/src/components/ProjectCards';

import styles from './projects.module.css';

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
      </main>
    </Layout>
  );
}
