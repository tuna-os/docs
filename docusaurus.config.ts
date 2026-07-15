import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {PROJECTS} from './src/data/projects';
import {VARIANTS} from './src/data/variants';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

// Navbar dropdowns derive from the same shared data as the /projects grid
// and each project's own landing page — a hand-maintained 3rd/4th copy of
// this list is exactly how bootc-migrate-composefs and Grouper went missing
// from menus that already listed every one of their siblings.
const variantNavItems = VARIANTS.map((v) => ({
  to: `/${v.id}`,
  label: `${v.emoji} ${v.name} — ${v.base}`,
}));

const projectNavItems = PROJECTS.filter((p) => !p.external).map((p) => ({
  to: `/${p.id}`,
  label: `${p.emoji} ${p.name}`,
}));

const externalProjectNavItems = PROJECTS.filter((p) => p.external).map((p) => ({
  to: `/${p.id}`,
  label: `${p.emoji} ${p.name} ↗`,
}));

const config: Config = {
  title: 'TunaOS',
  tagline: 'A Collection of Cloud-Native Enterprise Linux OS Images',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://tunaos.org',
  // Set the /<baseUrl>/ pathname under which your site is served
  baseUrl: '/',
  trailingSlash: false,
  onBrokenLinks: "warn",
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/tuna-os/docs/tree/main/',
        },
        blog: {
          showReadingTime: true,
          blogTitle: 'TunaOS Blog',
          blogDescription: 'Engineering updates, feature roundups, and build system deep-dives from the TunaOS image factory.',
          blogSidebarTitle: 'Recent posts',
          blogSidebarCount: 10,
          editUrl: 'https://github.com/tuna-os/docs/tree/main/',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  // Local search index built at build time — no external service/API key
  // needed (unlike Algolia DocSearch).
  themes: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        indexDocs: true,
        indexPages: true,
        docsRouteBasePath: '/docs',
      },
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/tunaos-social-card.png',
    navbar: {
      title: 'TunaOS',
      logo: {
        alt: 'TunaOS Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'dropdown',
          label: '🤖 AI',
          position: 'left',
          items: [
            {type: 'html', value: '<div style="padding:0.5rem 1rem;max-width:280px;font-size:0.875rem;line-height:1.5;color:var(--ifm-dropdown-link-color)">All the projects here are made primarily with LLMs. They span the range of slop to not. Some are very useful and usable while others are definitely not.</div>'},
          ],
        },
        {
          type: 'dropdown',
          label: '🐟 TunaOS',
          position: 'left',
          items: [
            ...variantNavItems,
            {type: 'html', value: '<hr style="margin:0.3rem 0;opacity:0.3">'},
            {to: '/matrix', label: '🗂️ Build Matrix'},
            {to: '/download', label: '📦 Download'},
          ],
        },
        {
          type: 'dropdown',
          label: '🧰 Projects',
          position: 'left',
          items: [
            ...projectNavItems,
            {to: '/copr', label: '⚙ COPR Builds'},
            {to: '/office', label: '🏢 Office Suite'},
            {to: '/flatpak', label: '📦 Flatpak'},
            {type: 'html', value: '<hr style="margin:0.3rem 0;opacity:0.3">'},
            ...externalProjectNavItems,
            {to: '/projects', label: 'All projects →'},
          ],
        },
        {
          to: '/blog',
          label: '📝 Blog',
          position: 'left',
        },
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/tuna-os/tunaOS',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'GitHub repository',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'TunaOS',
          items: [
            {
              label: 'Download',
              to: '/download',
            },
            {
              label: 'Documentation',
              to: 'docs/intro',
            },
            {
              label: 'System Requirements',
              to: 'docs/system-requirements',
            },
          ],
        },
        {
          title: 'Variants',
          items: VARIANTS.map((v) => ({label: `${v.name} (${v.base})`, to: `/${v.id}`})),
        },
        {
          title: 'Community',
          items: [
            {
              label: 'Matrix Chat',
              href: 'https://matrix.to/#/%23tunaos:reilly.asia',
            },
            {
              label: 'Universal Blue Discord',
              href: 'https://discord.gg/WEu6BdFEtp',
            },
            {
              label: 'AlmaLinux Atomic SIG',
              href: 'https://chat.almalinux.org/almalinux/channels/sigatomic',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/tuna-os/tunaOS',
            },
            {
              label: 'Project Bluefin',
              href: 'https://docs.projectbluefin.io',
            },
            {
              label: 'AlmaLinux Wiki',
              href: 'https://wiki.almalinux.org',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} TunaOS Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
