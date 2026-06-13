import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    // ── Getting started ──
    'intro',
    'installation',
    'installer',
    'system-requirements',
    {type: 'category', label: 'Variants', items: ['albacore', 'yellowfin', 'bonito', 'skipjack']},
    'bootc-resources',

    // ── Projects ──
    {type: 'doc', id: 'tunaos/index',           label: 'TunaOS'},
    {type: 'doc', id: 'tacklebox/index',        label: 'Tacklebox'},
    {type: 'doc', id: 'tromso/index',           label: 'Tromsø',          className: 'sidebar-alpha'},
    {type: 'doc', id: 'xfce-linux/index',        label: 'XFCE Linux',      className: 'sidebar-alpha'},
    {type: 'doc', id: 'copr/index',              label: 'COPR Builds'},
    {type: 'doc', id: 'tavern/index',            label: 'Tavern'},
    {type: 'doc', id: 'bluefin-cli/index',       label: 'bluefin-cli'},
  ],
};

export default sidebars;
