import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import AnimatedEmoji from '@site/src/components/AnimatedEmoji';
import styles from './styles.module.css';

type Project = {
  name: string;
  slug: string;
  icon: string;
  description: string;
  status: 'stable' | 'beta' | 'alpha' | 'experimental' | 'internal';
  links: {label: string; to: string}[];
};

const PROJECTS: Project[] = [
  {
    name: 'TunaOS',
    slug: '/docs/tunaos',
    icon: '🐟',
    description: 'Cloud-native Enterprise Linux desktop images built with bootc. GNOME, KDE, COSMIC, Niri on AlmaLinux, CentOS Stream, and Fedora.',
    status: 'stable',
    links: [
      {label: 'Documentation', to: '/docs/tunaos'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/tunaOS'},
      {label: 'Download', to: '/download'},
    ],
  },
  {
    name: 'Tacklebox',
    slug: '/docs/tacklebox',
    icon: '🛠',
    description: 'High-performance bootc orchestrator. Produces multi-boot USB drives, disk images, and deduplicated ISOs from OCI container images.',
    status: 'stable',
    links: [
      {label: 'Documentation', to: '/docs/tacklebox'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/tacklebox'},
    ],
  },
  {
