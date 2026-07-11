import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['intro', 'installation', 'installer', 'system-requirements', 'bootc-resources'],
    },
    {
      type: 'category',
      label: '🐟 Variants',
      collapsed: false,
      // Showcase: the rich, visual landing pages (custom React pages), with the
      // detailed per-variant reference docs nested beneath.
      items: [
        {type: 'link', label: 'Albacore — AlmaLinux 10', href: '/albacore'},
        {type: 'link', label: 'Yellowfin — AlmaLinux Kitten', href: '/yellowfin'},
        {type: 'link', label: 'Skipjack — CentOS Stream 10', href: '/skipjack'},
        {type: 'link', label: 'Redfin — RHEL 10', href: '/redfin'},
        {type: 'link', label: 'Bonito — Fedora 44', href: '/bonito'},
        {type: 'link', label: 'Grouper — Ubuntu 26.04', href: '/grouper'},
        {type: 'link', label: 'Marlin — Arch Linux', href: '/marlin'},
        {type: 'link', label: 'Flounder — Debian 13', href: '/flounder'},
        {type: 'link', label: 'Flounder Sid — Debian Sid', href: '/flounder-sid'},
        {type: 'link', label: 'Bonito Rawhide — Fedora Rawhide', href: '/bonito-rawhide'},
        {type: 'link', label: 'Sailfin — openSUSE Tumbleweed', href: '/sailfin'},
        {type: 'link', label: 'Guppy — Gentoo Linux', href: '/guppy'},
        {type: 'category', label: 'Reference docs', collapsed: true, items: ['albacore', 'yellowfin', 'bonito', 'skipjack', 'grouper']},
      ],
    },
    {
      type: 'category',
      label: 'TunaOS',
      link: {type: 'doc', id: 'tunaos/index'},
      items: [
        'tunaos/ROADMAP',
        'tunaos/CONTRIBUTING',
        'tunaos/SECURITY',
        {
          type: 'category',
          label: 'Developer Guide',
          collapsible: true,
          collapsed: true,
          items: ['tunaos/introduction', 'tunaos/building', 'tunaos/platform-engineering', 'tunaos/live-iso-generation', 'tunaos/ci-cd', 'tunaos/troubleshooting'],
        },
      ],
    },
    {
      type: 'category',
      label: '🧱 BuildStream Desktops',
      collapsed: false,
      items: [
        {type: 'category', label: 'Tromsø', link: {type: 'doc', id: 'tromso/index'}, items: ['tromso/SPEC']},
        {type: 'category', label: 'XFCE Linux', className: 'sidebar-alpha', link: {type: 'doc', id: 'xfce-linux/index'}, items: ['xfce-linux/README', 'xfce-linux/PROJECT_STATUS', 'xfce-linux/CONTRIBUTING']},
      ],
    },
    {
      type: 'category',
      label: '🛠 Tools',
      collapsed: false,
      items: [
        {type: 'category', label: 'Tacklebox', link: {type: 'doc', id: 'tacklebox/index'}, items: ['tacklebox/getting-started', 'tacklebox/ARCHITECTURE', 'tacklebox/github-iso-setup', 'tacklebox/TODO']},
        {type: 'category', label: '🐟 remora', link: {type: 'doc', id: 'remora/index'}, items: []},
        {
          type: 'category',
          label: '🤠 Corral',
          link: {type: 'doc', id: 'corral/index'},
          items: ['corral/getting-started', 'corral/vdi', 'corral/containers', 'corral/backup', 'corral/bootc', 'corral/windows', 'corral/gpu', 'corral/snapsched', 'corral/schedule', 'corral/proxmox'],
        },
        {
          type: 'category',
          label: 'bluefin-cli',
          link: {type: 'doc', id: 'bluefin-cli/index'},
          items: ['bluefin-cli/ai', 'bluefin-cli/cncf', 'bluefin-cli/gnome', 'bluefin-cli/menus', 'bluefin-cli/tools', 'bluefin-cli/vanilla-vs-extra', 'bluefin-cli/ROADMAP'],
        },
        {type: 'category', label: 'bootc-migrate-composefs', link: {type: 'doc', id: 'bootc-migrate-composefs/index'}, items: []},
        {type: 'category', label: 'COPR Builds', link: {type: 'doc', id: 'copr/index'}, items: ['copr/ARCHITECTURE', 'copr/gnome49-centos-bootc']},
      ],
    },
    {
      type: 'category',
      label: 'Apps',
      collapsed: false,
      items: [
        {type: 'category', label: 'Tavern', link: {type: 'doc', id: 'tavern/index'}, items: ['tavern/ROADMAP', 'tavern/CONTRIBUTING']},
        {type: 'category', label: '📊 Tables', link: {type: 'doc', id: 'tables/index'}, items: []},
        {type: 'category', label: '📝 Letters', link: {type: 'doc', id: 'letters/index'}, items: []},
        {type: 'category', label: '📽️ Decks', link: {type: 'doc', id: 'decks/index'}, items: []},
        {type: 'category', label: '🗺️ Mariner', link: {type: 'doc', id: 'mariner/index'}, items: []},
      ],
    },
    {type: 'html', value: '<div class="sidebar-section-label">Community</div>', defaultStyle: true},
    {type: 'doc', id: 'hawaii/index', label: 'Zirconium Hawaii', className: 'sidebar-external'},
    {type: 'category', label: 'Dakota (Bluefin)', className: 'sidebar-external', link: {type: 'doc', id: 'dakota/index'}, items: ['dakota/migration']},
  ],
};

export default sidebars;
