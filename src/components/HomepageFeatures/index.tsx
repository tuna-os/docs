import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import Icon, {type IconName} from '@site/src/components/Icon';
import styles from './styles.module.css';

type FeatureItem = {
  icon: IconName;
  title: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    icon: 'layers',
    title: 'BuildStream desktops',
    description: (
      <>
        Tromsø, XFCE Linux, Dakota — desktops built from source on{' '}
        freedesktop-sdk. Reproducible, auditable, 100% from-source pipelines.
      </>
    ),
  },
  {
    icon: 'box',
    title: 'bootc-native images',
    description: (
      <>
        Every project ships as a standard bootc OCI image. Pull it, boot it,{' '}
        rebase onto it — atomic updates and clean rollbacks built in.
      </>
    ),
  },
  {
    icon: 'disc',
    title: 'Multi-boot media',
    description: (
      <>
        Tacklebox produces ISOs and USB drives with multiple environments —{' '}
        pick your desktop at boot. File-level deduplication keeps sizes small.
      </>
    ),
  },
  {
    icon: 'grid',
    title: 'Desktop apps + CLI',
    description: (
      <>
        Tavern brings an App Store experience to Homebrew on Linux. bluefin-cli{' '}
        keeps your shell environment sharp. GNOME, KDE, COSMIC, Niri, XFCE.
      </>
    ),
  },
  {
    icon: 'shield',
    title: 'Enterprise Linux base',
    description: (
      <>
        TunaOS desktop images ship GNOME, KDE, and more on AlmaLinux, CentOS{' '}
        Stream, and Fedora — with 10-year support cycles and backported desktops.
      </>
    ),
  },
  {
    icon: 'users',
    title: 'Open source, open community',
    description: (
      <>
        Everything we build is open source. Contribute to upstream freedesktop-sdk,{' '}
        GNOME OS, KDE, or BuildStream — start here, level up, become part of the teams.
      </>
    ),
  },
];

function Feature({icon, title, description, index}: FeatureItem & {index: string}) {
  return (
    <div className={styles.featureCard}>
      <span className={styles.featureIndex}>{index}</span>
      <span className={styles.featureIcon}>
        <Icon name={icon} size={22} />
      </span>
      <Heading as="h3" className={styles.featureTitle}>
        {title}
      </Heading>
      <p className={styles.featureDesc}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <div className={styles.grid}>
      {FeatureList.map((feature, idx) => (
        <Feature key={idx} {...feature} index={String(idx + 1).padStart(2, '0')} />
      ))}
    </div>
  );
}