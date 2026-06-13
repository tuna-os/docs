import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'installation',
    'installer',
    'system-requirements',
    {type: 'category', label: 'Variants', items: ['albacore', 'yellowfin', 'bonito', 'skipjack']},
    'bootc-resources',
    {type: 'category', label: 'TunaOS', link: {type: 'doc', id: 'tunaos/index'}, items: ['tunaos/ROADMAP', 'tunaos/CONTRIBUTING', 'tunaos/SECURITY', {type: 'category', label: 'Developer Guide', collapsible: true, collapsed: true, items: ['tunaos/introduction', 'tunaos/building', 'tunaos/live-iso-generation', 'tunaos/ci-cd', 'tunaos/troubleshooting']}]},
    {type: 'category', label: 'Tacklebox', link: {type: 'doc', id: 'tacklebox/index'}, items: ['tacklebox/ARCHITECTURE', 'tacklebox/github-iso-setup', 'tacklebox/TODO']},
    {type: 'category', label: 'Tromsø', link: {type: 'doc', id: 'tromso/index'}, items: ['tromso/SPEC']},
    {type: 'category', label: 'COPR Builds', link: {type: 'doc', id: 'copr/index'}, items: ['copr/ARCHITECTURE']},
    {type: 'doc', id: 'xfce-linux/index', label: 'XFCE Linux', className: 'sidebar-alpha'},
    {type: 'category', label: 'Tavern', link: {type: 'doc', id: 'tavern/index'}, items: ['tavern/ROADMAP', 'tavern/CONTRIBUTING']},
    {type: 'category', label: 'bluefin-cli', link: {type: 'doc', id: 'bluefin-cli/index'}, items: ['bluefin-cli/ROADMAP']},
  ],
};

export default sidebars;
