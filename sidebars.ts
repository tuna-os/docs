import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    // ── Getting started ──
    'intro',
    'installation',
    'installer',
    'system-requirements',
    {
      type: 'category',
      label: 'Variants',
      collapsible: false,
      items: ['albacore', 'yellowfin', 'bonito', 'skipjack'],
    },
    'bootc-resources',

    // ── All projects at top level ──
    {
      type: 'category',
      label: 'TunaOS',
      collapsible: false,
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
          items: [
            'tunaos/introduction',
            'tunaos/building',
            'tunaos/live-iso-generation',
            'tunaos/ci-cd',
            'tunaos/troubleshooting',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'Tacklebox',
      collapsible: false,
      link: {type: 'doc', id: 'tacklebox/index'},
      items: [
        'tacklebox/ARCHITECTURE',
        'tacklebox/github-iso-setup',
        'tacklebox/TODO',
      ],
    },
    {
      type: 'category',
    {
      type: 'category',
      label: 'Tromsø',
      collapsible: false,
      link: {type: 'doc', id: 'tromso/index'},
      items: ['tromso/SPEC'],
    },
    {
      type: 'category',
      label: 'COPR Builds',
      collapsible: false,
      link: {type: 'doc', id: 'copr/index'},
      items: ['copr/ARCHITECTURE'],
    },
    {type: 'doc', id: 'bootc-installer/index', label: 'bootc-installer'},
    {type: 'doc', id: 'dakota/index',          label: 'Dakota ISO'},
    {type: 'doc', id: 'ubuntu/index',          label: 'Ubuntu ISO'},
    {type: 'doc', id: 'bonito-x13s/index',     label: 'Bonito X13s',     className: 'sidebar-experimental'},
    {type: 'doc', id: 'dakota-x13s/index',     label: 'Dakota X13s',     className: 'sidebar-experimental'},
    {type: 'doc', id: 'tromso-iso/index',       label: 'Tromsø ISO',      className: 'sidebar-alpha'},
    {type: 'doc', id: 'xfce-linux/index',        label: 'XFCE Linux',      className: 'sidebar-alpha'},
    {type: 'doc', id: 'xfce-linux-iso/index',    label: 'XFCE Linux ISO',  className: 'sidebar-alpha'},
    {
      type: 'category',
      label: 'Tavern',
      collapsible: false,
      link: {type: 'doc', id: 'tavern/index'},
      items: ['tavern/ROADMAP', 'tavern/CONTRIBUTING'],
    },
    {
      type: 'category',
      label: 'bluefin-cli',
      collapsible: false,
      link: {type: 'doc', id: 'bluefin-cli/index'},
      items: ['bluefin-cli/ROADMAP'],
    },
  ],
};

export default sidebars;
