import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'TunaOS',
  tagline: 'A Collection of Cloud-Native Enterprise Linux OS Images',
  favicon: 'img/favicon.svg',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://tuna-os.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'tuna-os', // Usually your GitHub org/user name.
  projectName: 'docs', // Usually your repo name.
  trailingSlash: false, // Set to true if you want to add a trailing slash to all URLs.
  onBrokenLinks: 'throw',
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
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/tunaos-social-card.png',
    navbar: {
      title: 'TunaOS',
      logo: {
        alt: 'TunaOS Logo',
        src: 'img/tuna-logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {
          href: 'https://github.com/tuna-os/tunaOS',
          label: 'GitHub',
          position: 'right',
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
          items: [
            {
              label: 'Albacore (AlmaLinux)',
              to: 'docs/albacore',
            },
            {
              label: 'Yellowfin (AlmaLinux Kitten)',
              to: 'docs/yellowfin',
            },
            {
              label: 'Bonito (Fedora)',
              to: 'docs/bonito',
            },
            {
              label: 'Skipjack (CentOS)',
              to: 'docs/skipjack',
            },
          ],
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
