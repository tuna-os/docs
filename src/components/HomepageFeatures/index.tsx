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
        Tromsø, XFCE Linux and Dakota are built from source on freedesktop-sdk{' '}
        with BuildStream, rather than assembled from prebuilt packages.
      </>
    ),
  },
  {
    icon: 'box',
    title: 'bootc OCI images',
    description: (
      <>
        Every image is a standard bootc OCI image. Pull it, boot it, or rebase{' '}
        onto it; updates are atomic and roll back to the previous image.
      </>
    ),
  },
  {
    icon: 'disc',
    title: 'Multi-boot media',
    description: (
      <>
        Tacklebox writes ISOs and USB drives holding several desktops, chosen{' '}
        at boot. File-level deduplication keeps the image size down.
      </>
    ),
  },
  {
    icon: 'grid',
    title: 'Desktop apps and CLI',
    description: (
      <>
        Tavern is a GTK4 front end for Homebrew on Linux. bluefin-cli configures{' '}
        shells and development environments from the terminal.
      </>
    ),
  },
  {
    icon: 'shield',
    title: 'Enterprise Linux bases',
    description: (
      <>
        GNOME, KDE and other desktops on AlmaLinux, CentOS Stream and Fedora,{' '}
        with current desktop versions backported onto long-support bases.
      </>
    ),
  },
  {
    icon: 'users',
    title: 'Open source',
    description: (
      <>
        Everything here is open source, and much of the work lands upstream in{' '}
        freedesktop-sdk, GNOME OS, KDE and BuildStream.
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