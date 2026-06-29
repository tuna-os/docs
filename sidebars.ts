import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'installation',
    'installer',
    'system-requirements',
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
        {type: 'link', label: 'Bonito — Fedora 44', href: '/bonito'},
        {type: 'category', label: 'Reference docs', collapsed: true, items: ['albacore', 'yellowfin', 'bonito', 'skipjack']},
      ],
    },
    'bootc-resources',
    {type: 'category', label: 'TunaOS', link: {type: 'doc', id: 'tunaos/index'}, items: ['tunaos/ROADMAP', 'tunaos/CONTRIBUTING', 'tunaos/SECURITY', {type: 'category', label: 'Developer Guide', collapsible: true, collapsed: true, items: ['tunaos/introduction', 'tunaos/building', 'tunaos/cosmic-desktop', 'tunaos/live-iso-generation', 'tunaos/ci-cd', 'tunaos/troubleshooting']}]},
    {type: 'category', label: 'Tacklebox', link: {type: 'doc', id: 'tacklebox/index'}, items: ['tacklebox/ARCHITECTURE', 'tacklebox/github-iso-setup', 'tacklebox/TODO']},
    {type: 'category', label: 'Tromsø', link: {type: 'doc', id: 'tromso/index'}, items: ['tromso/SPEC']},
    {type: 'category', label: 'COPR Builds', link: {type: 'doc', id: 'copr/index'}, items: ['copr/ARCHITECTURE']},
    {type: 'category', label: '🤠 Corral', link: {type: 'doc', id: 'corral/index'}, items: []},
    {type: 'category', label: 'XFCE Linux', className: 'sidebar-alpha', link: {type: 'doc', id: 'xfce-linux/index'}, items: ['xfce-linux/README', 'xfce-linux/PROJECT_STATUS', 'xfce-linux/CONTRIBUTING']},
    {type: 'category', label: 'Tavern', link: {type: 'doc', id: 'tavern/index'}, items: ['tavern/ROADMAP', 'tavern/CONTRIBUTING']},
    {type: 'category', label: '📊 Tables', link: {type: 'doc', id: 'tables/index'}, items: []},
    {type: 'category', label: '📝 Letters', link: {type: 'doc', id: 'letters/index'}, items: []},
    {type: 'category', label: '📽️ Decks', link: {type: 'doc', id: 'decks/index'}, items: []},
    {type: 'category', label: 'bluefin-cli', link: {type: 'doc', id: 'bluefin-cli/index'}, items: ['bluefin-cli/ROADMAP']},
    {type: 'html', value: '<div class="sidebar-section-label">Community</div>', defaultStyle: true},
    {type: 'doc', id: 'hawaii/index', label: 'Zirconium Hawaii', className: 'sidebar-external'},
    {type: 'doc', id: 'dakota/index', label: 'Dakota (Bluefin)', className: 'sidebar-external'},
  ],
};

export default sidebars;
