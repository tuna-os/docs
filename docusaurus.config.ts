import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

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
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'dropdown',
          label: '🐟 Variants',
          position: 'left',
          items: [
            {to: '/albacore', label: '🐟 Albacore — AlmaLinux 10'},
            {to: '/yellowfin', label: '🐠 Yellowfin — AlmaLinux Kitten'},
            {to: '/skipjack', label: '🍣 Skipjack — CentOS Stream 10'},
            {to: '/bonito', label: '🎣 Bonito — Fedora 44'},
          ],
        },
        {
          type: 'dropdown',
          label: '🧰 Projects',
          position: 'left',
          items: [
            {to: '/tunaos', label: '🐟 TunaOS'},
            {to: '/tacklebox', label: '🛠 Tacklebox'},
            {to: '/tromso', label: '🌌 Tromsø'},
            {to: '/xfce-linux', label: '🖥️ XFCE Linux'},
            {to: '/tavern', label: '🍻 Tavern'},
            {to: '/bluefin-cli', label: '⌨️ bluefin-cli'},
            {to: '/corral', label: '🤠 Corral'},
            {to: '/tables', label: '📊 Tables'},
            {to: '/letters', label: '📝 Letters'},
            {to: '/decks', label: '📽️ Decks'},
            {to: '/copr', label: '⚙ COPR Builds'},
            {to: '/office', label: '🏢 Office Suite (Tables, Letters, Decks)'},
            {type: 'html', value: '<hr style="margin:0.3rem 0;opacity:0.3">'},
            {to: '/dakota', label: '🦖 Dakota ↗'},
            {to: '/hawaii', label: '🌺 Zirconium Hawaii ↗'},
            {to: '/projects', label: 'All projects →'},
          ],
        },
        {
          to: '/download',
          label: '📦 Download',
          position: 'left',
        },
        {
          to: '/matrix',
          label: '🗂️ Build Matrix',
          position: 'left',
        },
        {
          to: '/office',
          label: '🏢 Office Suite',
          position: 'left',
        },
        {
          to: '/flatpak',
          label: '📦 Flatpak',
          position: 'left',
        },
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
          items: [
            {
              label: 'Albacore (AlmaLinux)',
              to: '/albacore',
            },
            {
              label: 'Yellowfin (AlmaLinux Kitten)',
              to: '/yellowfin',
            },
            {
              label: 'Bonito (Fedora)',
              to: '/bonito',
            },
            {
              label: 'Skipjack (CentOS)',
              to: '/skipjack',
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
