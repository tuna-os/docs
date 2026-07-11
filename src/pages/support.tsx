import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

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
          { label: 'ko-fi', href: 'https://ko-fi.com/valerie-tar-gz' },
          { label: 'venmo', href: 'https://venmo.com/u/bri-recchia' },
          { label: 'ko-fi/brirec', href: 'https://ko-fi.com/brirec' },
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

export default function Support(): JSX.Element {
  return (
    <Layout
      title="Support"
      description="Support the projects that make TunaOS possible."
    >
      <main className="container margin-vert--lg">
        <Heading as="h1">Support</Heading>
        <p>
          TunaOS is an image factory — we multiply desktop experiences across
          distributions. But those experiences are built by other people. If you
          find value in what we ship, the most impactful thing you can do is
          support the upstream projects that create the desktops and
          customizations we depend on.
        </p>

        {SPONSOR_SECTIONS.map((section) => (
          <section key={section.title} style={{ marginTop: '2.5rem' }}>
            <Heading as="h2">{section.title}</Heading>
            <p>{section.description}</p>
            <div className="row">
              {section.projects.map((project) => (
                <div key={project.name} className="col col--4 margin-bottom--md">
                  <div
                    className="card"
                    style={{
                      padding: '1.25rem',
                      height: '100%',
                    }}
                  >
                    <Heading as="h3" style={{ marginTop: 0 }}>
                      {project.name}
                    </Heading>
                    <p
                      style={{
                        fontSize: '0.85rem',
                        color: 'var(--ifm-color-emphasis-600)',
                        marginBottom: '0.75rem',
                      }}
                    >
                      {project.desktop}
                    </p>
                    <ul style={{ paddingLeft: '1rem', margin: 0 }}>
                      {project.links.map((link) => (
                        <li key={link.href} style={{ marginBottom: '0.35rem' }}>
                          <a href={link.href} target="_blank" rel="noopener noreferrer">
                            {link.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </Layout>
  );
}
