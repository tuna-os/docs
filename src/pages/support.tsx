import type {ReactNode} from 'react';
import clsx from 'clsx';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from '@site/src/css/page.module.css';

const SPONSOR_SECTIONS = [
  {
    title: 'Desktop Upstreams',
    description:
      'These projects provide the customization layers and desktop defaults that TunaOS ships across every variant. Without them, we\'d just be installing stock packages.',
    projects: [
      {
        name: 'Project Bluefin',
        desktop: 'GNOME',
        links: [
          { label: 'Sponsor @castrojo', href: 'https://github.com/sponsors/castrojo' },
          { label: 'Sponsor @tulilirockz', href: 'https://github.com/sponsors/tulilirockz' },
        ],
      },
      {
        name: 'Aurora',
        desktop: 'KDE Plasma',
        links: [
          { label: 'Sponsor @NiHaiden', href: 'https://github.com/sponsors/NiHaiden' },
        ],
      },
      {
        name: 'Zirconium',
        desktop: 'Niri',
        links: [
          { label: 'Sponsor @tulilirockz', href: 'https://github.com/sponsors/tulilirockz' },
        ],
      },
    ],
  },
  {
    title: 'Desktop Environments',
    description:
      'The desktop environments themselves are monumental community efforts. Consider supporting them directly.',
    projects: [
      {
        name: 'GNOME',
        desktop: 'Desktop',
        links: [
          { label: 'Donate to GNOME Foundation', href: 'https://www.gnome.org/donate/' },
        ],
      },
      {
        name: 'KDE',
        desktop: 'Desktop',
        links: [
          { label: 'Donate to KDE e.V.', href: 'https://kde.org/community/donations/' },
        ],
      },
      {
        name: 'XFCE',
        desktop: 'Desktop',
        links: [
          { label: 'Donate to XFCE', href: 'https://xfce.org/donate' },
        ],
      },
      {
        name: 'Niri',
        desktop: 'Compositor',
        links: [
          { label: 'Sponsor @YaLTeR', href: 'https://github.com/sponsors/YaLTeR' },
        ],
      },
    ],
  },
  {
    title: 'Infrastructure',
    description:
      'The foundational projects that make image-based Linux desktops possible.',
    projects: [
      {
        name: 'bootc',
        desktop: 'Core',
        links: [
          { label: 'GitHub', href: 'https://github.com/containers/bootc' },
        ],
      },
      {
        name: 'bootcrew',
        desktop: 'Base images',
        links: [
          { label: 'GitHub', href: 'https://github.com/bootcrew/mono' },
        ],
      },
      {
        name: 'Universal Blue',
        desktop: 'Ecosystem',
        links: [
          { label: 'Website', href: 'https://universal-blue.org/' },
        ],
      },
    ],
  },
];

export default function Support(): ReactNode {
  return (
    <Layout
      title="Support"
      description="Support the projects that make TunaOS possible."
    >
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <span className={styles.eyebrow}>Support upstream</span>
          <Heading as="h1" className={styles.heroTitle}>
            Support the upstream projects
          </Heading>
          <p className={styles.heroLede}>
            TunaOS packages desktops it does not write. The customization layers and
            the desktop environments themselves come from the projects below, so
            sponsoring them is more useful than sponsoring us.
          </p>
        </div>
      </header>

      <main>
        {SPONSOR_SECTIONS.map((section, index) => (
          <section
            key={section.title}
            className={clsx(
              styles.section,
              index === 0 && styles.sectionFirst,
              index % 2 === 1 && styles.sectionAlt,
            )}
          >
            <div className={styles.sectionInner}>
              <div className={styles.sectionHead}>
                <Heading as="h2" className={styles.sectionTitle}>
                  <span className={styles.sectionMark}>
                    {String(index + 1).padStart(2, '0')}.
                  </span>
                  {section.title}
                </Heading>
                <p className={styles.sectionSub}>{section.description}</p>
              </div>
              <div className={styles.grid}>
                {section.projects.map((project) => (
                  <div key={project.name} className={styles.card}>
                    <Heading as="h3" className={styles.cardTitle}>
                      {project.name}
                    </Heading>
                    <span className={styles.chip}>{project.desktop}</span>
                    <ul className={styles.linkList} style={{marginTop: '1rem'}}>
                      {project.links.map((link) => (
                        <li key={link.href}>
                          <a href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        ))}
      </main>
    </Layout>
  );
}
