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
    name: 'bootc-installer',
    slug: '/docs/bootc-installer',
    icon: '💻',
    description: 'Terminal UI installer for bootc-based systems. 11-step wizard — network, disk, encryption, SSH keys, and live progress.',
    status: 'stable',
    links: [
      {label: 'Documentation', to: '/docs/bootc-installer'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/bootc-installer-tui'},
    ],
  },
  {
    name: 'Dakota ISO',
    slug: '/docs/dakota',
    icon: '🎣',
    description: 'Bootable UEFI live ISO for Project Bluefin Dakota. Offline installation via tuna-installer with composefs and systemd-boot.',
    status: 'stable',
    links: [
      {label: 'Documentation', to: '/docs/dakota'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/dakota-iso'},
      {label: 'Download', to: 'https://download.tunaos.org/dakota/dakota-live-latest.iso'},
    ],
  },
  {
    name: 'Ubuntu ISO',
    slug: '/docs/ubuntu',
    icon: '🦝',
    description: 'Ubuntu 26.04 Resolute Raccoon live installable ISO built with bootc. Traditional Ubuntu experience, immutable delivery.',
    status: 'stable',
    links: [
      {label: 'Documentation', to: '/docs/ubuntu'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/ubuntu-26.04-iso'},
      {label: 'Download', to: 'https://download.tunaos.org/ubuntu-26.04/ubuntu-26.04-latest.iso'},
    ],
  },
  {
    name: 'Tromsø',
    slug: '/docs/tromso',
    icon: '🌋',
    description: 'A BuildStream-based KDE Linux distribution. Builds desktop OS images from source with reproducible pipelines.',
    status: 'alpha',
    links: [
      {label: 'Documentation', to: '/docs/tromso'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/tromso'},
    ],
  },
  {
    name: 'Tromsø ISO',
    slug: '/docs/tromso-iso',
    icon: '🌋',
    description: 'Live ISO builder for Tromsø KDE Linux. Produces bootable UEFI images with systemd-boot and tuna-installer.',
    status: 'alpha',
    links: [
      {label: 'Documentation', to: '/docs/tromso-iso'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/tromso-iso'},
    ],
  },
  {
    name: 'XFCE Linux',
    slug: '/docs/xfce-linux',
    icon: '🖥️',
    description: 'XFCE Wayland OCI image built with BuildStream. A lightweight desktop experience on an immutable base.',
    status: 'alpha',
    links: [
      {label: 'Documentation', to: '/docs/xfce-linux'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/xfce-linux'},
    ],
  },
  {
    name: 'XFCE Linux ISO',
    slug: '/docs/xfce-linux-iso',
    icon: '🖥️',
    description: 'Live ISO for xfce-linux — systemd-boot, tuna-installer, bootc. Bootable UEFI image for the lightweight XFCE desktop.',
    status: 'alpha',
    links: [
      {label: 'Documentation', to: '/docs/xfce-linux-iso'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/xfce-linux-iso'},
    ],
  },
  {
    name: 'Bonito X13s',
    slug: '/docs/bonito-x13s',
    icon: '💪',
    description: 'Bootc image and live ISO for the Lenovo ThinkPad X13s — Qualcomm SC8280XP, aarch64. Fedora-based with GNOME.',
    status: 'experimental',
    links: [
      {label: 'Documentation', to: '/docs/bonito-x13s'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/bonito-x13s'},
    ],
  },
  {
    name: 'Dakota X13s',
    slug: '/docs/dakota-x13s',
    icon: '💪',
    description: 'Project Bluefin Dakota live ISO for the Lenovo ThinkPad X13s. Qualcomm SC8280XP, aarch64.',
    status: 'experimental',
    links: [
      {label: 'Documentation', to: '/docs/dakota-x13s'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/dakota-x13s'},
    ],
  },
  {
    name: 'COPR Builds',
    slug: '/docs/copr',
    icon: '⚙',
    description: 'GitHub Actions-based RPM build system for TunaOS. Builds packages from COPR-like specs with Cloudflare R2 distribution.',
    status: 'internal',
    links: [
      {label: 'Documentation', to: '/docs/copr'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/github-copr'},
    ],
  },
  {
    name: 'Tavern',
    slug: '/docs/tavern',
    icon: '🍻',
    description: 'A modern, fast Homebrew client for Linux built with GTK 4 and Libadwaita. App Store experience for managing formulae and casks.',
    status: 'stable',
    links: [
      {label: 'Documentation', to: '/docs/tavern'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/Tavern'},
    ],
  },
  {
    name: 'bluefin-cli',
    slug: '/docs/bluefin-cli',
    icon: '⌨️',
    description: 'Powerful CLI tool for shell configuration and dev environment customization. Beautiful TUIs built with Charm libraries.',
    status: 'stable',
    links: [
      {label: 'Documentation', to: '/docs/bluefin-cli'},
      {label: 'GitHub', to: 'https://github.com/tuna-os/bluefin-cli'},
    ],
  },
];

const STATUS_LABELS: Record<string, string> = {
  stable: 'Stable',
  beta: 'Beta',
  alpha: 'Alpha',
  experimental: 'Experimental',
  internal: 'Internal',
};

function ProjectCard({project}: {project: Project}) {
  const statusClass = styles[`badge-${project.status}`] || '';
  const borderClass = styles[`status-${project.status}`] || '';
  return (
    <div className={`${styles.card} ${borderClass}`}>
      <div className={styles.cardTop}>
        <span className={styles.icon}><AnimatedEmoji emoji={project.icon} size={32} /></span>
        <div>
          <h3 className={styles.name}>
            <Link to={project.slug}>{project.name}</Link>
          </h3>
          <span className={`${styles.badge} ${statusClass}`}>
            {STATUS_LABELS[project.status]}
          </span>
        </div>
      </div>
      <p className={styles.desc}>{project.description}</p>
      <div className={styles.links}>
        {project.links.map((link) => (
          <Link key={link.label} className={styles.link} to={link.to}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function ProjectCards(): ReactNode {
  return (
    <div className={styles.grid}>
      {PROJECTS.map((p) => (
        <ProjectCard key={p.slug} project={p} />
      ))}
    </div>
  );
}
