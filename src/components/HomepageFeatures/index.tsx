import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  emoji: string;
  description: ReactNode;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'BuildStream desktops',
    emoji: '🌌',
    description: (
      <>
        Tromsø, XFCE Linux, Dakota, Hawaii — desktops built from source on{' '}
        freedesktop-sdk. Reproducible, auditable, 100% from-source pipelines.
      </>
    ),
  },
  {
    title: 'bootc-native images',
    emoji: '📦',
    description: (
      <>
        Every project ships as a standard bootc OCI image. Pull it, boot it,{' '}
        rebase onto it — atomic updates and clean rollbacks built in.
      </>
    ),
  },
  {
    title: 'Multi-boot media',
    emoji: '🛠',
    description: (
      <>
        Tacklebox produces ISOs and USB drives with multiple environments —{' '}
        pick your desktop at boot. File-level deduplication keeps sizes small.
      </>
    ),
  },
  {
    title: 'Desktop apps + CLI',
    emoji: '🍻',
    description: (
      <>
        Tavern brings an App Store experience to Homebrew on Linux. bluefin-cli{' '}
        keeps your shell environment sharp. GNOME, KDE, COSMIC, Niri, XFCE.
      </>
    ),
  },
  {
    title: 'Enterprise Linux base',
    emoji: '🐟',
    description: (
      <>
        TunaOS desktop images ship GNOME, KDE, and more on AlmaLinux, CentOS{' '}
        Stream, and Fedora — with 10-year support cycles and backported desktops.
      </>
    ),
  },
  {
    title: 'Open source, open community',
    emoji: '🚀',
    description: (
      <>
        Everything we build is open source. Contribute to upstream freedesktop-sdk,{' '}
        GNOME OS, KDE, or BuildStream — start here, level up, become part of the teams.
      </>
    ),
  },
];

function Feature({title, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {emoji && <div className={styles.featureEmoji}>{emoji}</div>}
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
