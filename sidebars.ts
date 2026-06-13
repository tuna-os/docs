import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    'intro',
    'installation',
    'installer',
    'system-requirements',
    {
      type: 'category',
      label: 'Variants',
      items: ['albacore', 'yellowfin', 'bonito', 'skipjack'],
    },
    'bootc-resources',
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
      link: {type: 'doc', id: 'tacklebox/index'},
      items: [
        'tacklebox/ARCHITECTURE',
        'tacklebox/TODO',
        'tacklebox/github-iso-setup',
      ],
    },
    {
      type: 'category',
      label: 'chunkah',
      link: {type: 'doc', id: 'chunkah/index'},
      items: ['chunkah/CONTRIBUTING'],
    },
    {
      type: 'category',
      label: 'bootc-installer',
      link: {type: 'doc', id: 'bootc-installer/index'},
      items: [],
    },
    {
      type: 'category',
      label: 'Dakota ISO',
      link: {type: 'doc', id: 'dakota/index'},
      items: [],
    },
    {
      type: 'category',
      label: 'Ubuntu ISO',
      link: {type: 'doc', id: 'ubuntu/index'},
      items: [],
    },
    {
      type: 'category',
      label: 'Bonito X13s',
      link: {type: 'doc', id: 'bonito-x13s/index'},
      items: [],
    },
    {
      type: 'category',
      label: 'Dakota X13s',
      link: {type: 'doc', id: 'dakota-x13s/index'},
      items: [],
    },
    {
      type: 'category',
      label: 'Tromsø',
      link: {type: 'doc', id: 'tromso/index'},
      items: ['tromso/SPEC'],
    },
  ],
};

export default sidebars;
