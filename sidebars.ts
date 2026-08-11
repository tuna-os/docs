import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: ['intro', 'architecture', 'installation', 'installer', 'system-requirements', 'bootc-resources', 'faq', 'ublue-ecosystem'],
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
        {type: 'link', label: 'Hummingbird — Fedora Hummingbird', href: '/hummingbird'},
        {type: 'link', label: 'Grouper — Ubuntu 26.04', href: '/grouper'},
        {type: 'link', label: 'Gurnard — Ubuntu 24.04 (Pantheon)', href: '/gurnard'},
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
          items: ['tunaos/introduction', 'tunaos/building', 'tunaos/ai-ml-development', 'tunaos/bootc-usage', 'tunaos/cosmic-desktop', 'tunaos/homebrew', 'tunaos/platform-engineering', 'tunaos/live-iso-generation', 'tunaos/installer-walkthrough/index', 'tunaos/ci-cd', 'tunaos/troubleshooting'],
        },
      ],
    },
    {
      type: 'category',
      label: '🧱 BuildStream Desktops',
      collapsed: false,
      items: [
        {type: 'category', label: 'Tromsø', link: {type: 'doc', id: 'tromso/index'}, items: ['tromso/getting-started', 'tromso/SPEC', 'tromso/ROADMAP', 'tromso/SECURITY', 'tromso/CONTRIBUTING', 'tromso/ci-and-iso-pipeline']},
        {type: 'category', label: 'XFCE Linux', className: 'sidebar-alpha', link: {type: 'doc', id: 'xfce-linux/index'}, items: ['xfce-linux/getting-started', 'xfce-linux/README', 'xfce-linux/PROJECT_STATUS', 'xfce-linux/CONTRIBUTING', 'xfce-linux/ROADMAP', 'xfce-linux/SECURITY', 'xfce-linux/ci-and-iso-pipeline']},
      ],
    },
    {
      type: 'category',
      label: '🛠 Tools',
      collapsed: false,
      items: [
        {type: 'category', label: 'Tacklebox', link: {type: 'doc', id: 'tacklebox/index'}, items: ['tacklebox/user-guide', 'tacklebox/getting-started', 'tacklebox/ARCHITECTURE', 'tacklebox/github-iso-setup', 'tacklebox/TODO', 'tacklebox/ROADMAP', 'tacklebox/SECURITY', 'tacklebox/CONTRIBUTING', 'tacklebox/opfs-streaming-handoff']},
        {type: 'category', label: 'ISO Builder', link: {type: 'doc', id: 'iso-builder/index'}, items: [{type: 'category', label: 'Native App', link: {type: 'doc', id: 'iso-builder/native/index'}, items: ['iso-builder/native/user-guide']}]},
        {type: 'category', label: '🐟 remora', link: {type: 'doc', id: 'remora/index'}, items: []},
        {
          type: 'category',
          label: '🤠 Corral',
          link: {type: 'doc', id: 'corral/index'},
          items: ['corral/getting-started', 'corral/user-guide', 'corral/interfaces', 'corral/contexts', 'corral/command-reference', 'corral/vdi', 'corral/containers', 'corral/backup', 'corral/bootc', 'corral/windows', 'corral/gpu', 'corral/snapsched', 'corral/schedule', 'corral/proxmox', 'corral/SPEC', 'corral/architecture', 'corral/api', 'corral/backend-support', 'corral/backend-parity', 'corral/ci-boot-gate', 'corral/first-party-plugins', 'corral/kubevirt-proxmox-setup', 'corral/plugin-marketplace', 'corral/proxmox-api', 'corral/testing'],
        },
        {
          type: 'category',
          label: 'bluefin-cli',
          link: {type: 'doc', id: 'bluefin-cli/index'},
          items: ['bluefin-cli/ai', 'bluefin-cli/cncf', 'bluefin-cli/gnome', 'bluefin-cli/menus', 'bluefin-cli/tools', 'bluefin-cli/vanilla-vs-extra', 'bluefin-cli/ROADMAP', 'bluefin-cli/CONTRIBUTING'],
        },
        {
          type: 'category',
          label: 'bootc-migrate',
          link: {type: 'doc', id: 'bootc-migrate/index'},
          items: ['bootc-migrate/architecture', 'bootc-migrate/filesystem-support', 'bootc-migrate/luks-testing', 'bootc-migrate/testing', 'bootc-migrate/references', 'bootc-migrate/ROADMAP', 'bootc-migrate/CONTRIBUTING', 'bootc-migrate/cfs-cli-generations'],
        },
        {type: 'category', label: 'COPR Builds', link: {type: 'doc', id: 'copr/index'}, items: ['copr/ARCHITECTURE', 'copr/gnome49-centos-bootc']},
        {type: 'category', label: '📦 Flatpak', link: {type: 'doc', id: 'flatpak/index'}, items: ['flatpak/guide']},
        {type: 'category', label: '📦 tunaos-packages', link: {type: 'doc', id: 'tunaos-packages/index'}, items: ['tunaos-packages/ARCHITECTURE', 'tunaos-packages/PACKAGE_FACTORY', 'tunaos-packages/PATCH_POLICY', 'tunaos-packages/SECURITY', 'tunaos-packages/TIDEFORGE-READINESS', 'tunaos-packages/UPSTREAM_PARITY', 'tunaos-packages/XFWL4-PORTING', 'tunaos-packages/gnome49-centos-bootc', 'tunaos-packages/hummingbird-desktop-gap', 'tunaos-packages/CONTRIBUTING']},
        {type: 'category', label: '🐧 Ubuntu', link: {type: 'doc', id: 'ubuntu/index'}, items: ['ubuntu/CONTRIBUTING', 'ubuntu/SECURITY']},
        {type: 'category', label: '🖥️ bootc-installer-tui', link: {type: 'doc', id: 'bootc-installer-tui/index'}, items: ['bootc-installer-tui/CONTRIBUTING']},
        {type: 'category', label: '🧱 chunkah', link: {type: 'doc', id: 'chunkah/index'}, items: ['chunkah/CONTRIBUTING']},
      ],
    },
    {
      type: 'category',
      label: '🗂 Images & ISOs',
      collapsed: false,
      items: [
        {type: 'doc', id: 'tromso-iso/index', label: 'Tromsø ISO'},
        {type: 'doc', id: 'dakota-iso/index', label: 'Dakota ISO'},
        {type: 'doc', id: 'xfce-linux-iso/index', label: 'XFCE Linux ISO'},
        {type: 'doc', id: 'ubuntu-26-04-iso/index', label: 'Ubuntu 26.04 ISO'},
        {type: 'doc', id: 'bonito-x13s/index', label: 'Bonito X13s'},
        {type: 'doc', id: 'dakota-x13s/index', label: 'Dakota X13s'},
      ],
    },
    {
      type: 'category',
      label: 'Apps',
      collapsed: false,
      items: [
        {type: 'category', label: 'Tavern', link: {type: 'doc', id: 'tavern/index'}, items: ['tavern/ROADMAP', 'tavern/CONTRIBUTING', 'tavern/guide']},
        {type: 'doc', id: 'gtk-office-suite/index', label: '🏢 Office Suite'},
        {type: 'category', label: '🗺️ Mariner', link: {type: 'doc', id: 'mariner/index'}, items: []},
        {type: 'category', label: '🌀 Mandelbrot', link: {type: 'doc', id: 'mandelbrot/index'}, items: ['mandelbrot/features']},
      ],
    },
    {type: 'html', value: '<div class="sidebar-section-label">Community</div>', defaultStyle: true},
    'community',
    {type: 'category', label: 'Dakota (Bluefin)', className: 'sidebar-external', link: {type: 'doc', id: 'dakota/index'}, items: ['dakota/migration']},
  ],
};

export default sidebars;
