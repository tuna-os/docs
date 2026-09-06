import type {ReactNode} from 'react';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import ProjectCards from '@site/src/components/ProjectCards';

import page from '@site/src/css/page.module.css';

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
        <section className={`${page.section} ${page.sectionFirst}`}>
          <div className={page.sectionInner}>
            <ProjectCards />
          </div>
        </section>
      </main>
    </Layout>
  );
}
