import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import {MAIN_VARIANTS} from './src/data/variants';

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

  markdown: {
    // Every page is parsed as MDX, where `<!-- ... -->` is a syntax error.
    // This compat flag turns HTML comments into MDX comments, and it was on by
    // default until `future.v4` started disabling it in Docusaurus 3.10 — which
    // broke the build on the `<!-- truncate -->` marker in every blog post and
    // on the `<!-- ste-disable-file: ... -->` pragmas tuna-os/.github's ste-lint action
    // reads. Writing `{/* ... */}` instead is not a drop-in replacement: an
    // MDX comment survives createExcerpt(), so a leading pragma becomes the
    // page's meta description.
    mdx1Compat: {comments: true},
  },

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
            editUrl:
              'https://github.com/tuna-os/docs/tree/main/',
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
    colorMode: {
      // The TunaOS look is ocean-dark; land everyone there first.
      defaultMode: 'dark',
      disableSwitch: false,
    },
    navbar: {
      title: 'TunaOS',
      logo: {
        alt: 'TunaOS Logo',
        src: 'img/logo.png',
      },
      items: [
        {
          type: 'dropdown',
          label: 'AI',
          position: 'left',
          items: [
            {type: 'html', value: '<div style="padding:0.5rem 1rem;max-width:280px;font-size:0.875rem;line-height:1.5;color:var(--ifm-dropdown-link-color)">All the projects here are made primarily with LLMs. They span the range of slop to not. Some are very useful and usable while others are definitely not.</div>'},
            {type: 'html', value: '<hr style="margin:0.3rem 0;opacity:0.3">'},
            {href: 'https://hive.tunaos.org', label: 'Hive'},
          ],
        },
        {to: '/download', label: 'Download', position: 'left'},
        {to: '/wootc', label: 'From Windows', position: 'left'},
        {to: '/flatpak', label: 'Apps', position: 'left'},
        {to: '/projects', label: 'Projects', position: 'left'},
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
              label: 'Try from Windows',
              to: '/wootc',
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
          title: 'Images',
          items: [
            ...MAIN_VARIANTS.map((v) => ({label: `${v.name} (${v.base})`, to: `/${v.id}`})),
            {label: 'All variants', to: '/variants'},
            {label: 'Build matrix', to: '/matrix'},
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
              label: 'Discord',
              href: 'https://discord.gg/MXSTqB8Nv',
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
              label: 'Hive',
              href: 'https://hive.tunaos.org',
            },
            {
              label: 'Apps',
              to: '/flatpak',
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
      copyright:
        `Copyright © ${new Date().getFullYear()} TunaOS Project. ` +
        'Site design by <a href="https://github.com/HuntedRaven7">HuntedRaven</a>. ' +
        'Built with Docusaurus.',
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
