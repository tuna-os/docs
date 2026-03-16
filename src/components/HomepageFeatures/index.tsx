import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg?: React.ComponentType<React.ComponentProps<'svg'>>;
  description: ReactNode;
  emoji?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Latest GNOME Desktop',
    emoji: '🖥️',
    description: (
      <>
        Experience GNOME 48.3 on Enterprise Linux. We backport the latest 
        features to provide a modern desktop experience on a stable base.
      </>
    ),
  },
  {
    title: 'Baked-in Homebrew',
    emoji: '🍺',
    description: (
      <>
        Homebrew is pre-installed, giving you instant access to a massive 
        library of CLI tools and fonts that aren't in standard EL repos.
      </>
    ),
  },
  {
    title: 'HWE & v2 Support',
    emoji: '🚀',
    description: (
      <>
        Hardware Enablement (HWE) for new gear and x86_64_v2 support for older 
        hardware. We make sure TunaOS runs everywhere you need it.
      </>
    ),
  },
  {
    title: 'Bootc Technology',
    emoji: '📦',
    description: (
      <>
        Built on modern bootc container technology for immutable, reliable 
        systems with easy updates, rollbacks, and customization.
      </>
    ),
  },
  {
    title: 'Flathub by Default',
    emoji: '🛍️',
    description: (
      <>
        Get all your favorite desktop apps immediately. Flathub is enabled 
        out-of-the-box for a "ready-to-use" experience.
      </>
    ),
  },
  {
    title: 'Enterprise Stability',
    emoji: '🏢',
    description: (
      <>
        Based on AlmaLinux 10 and CentOS 10, providing a rock-solid foundation 
        with 10 years of support for your critical workflows.
      </>
    ),
  },
];

function Feature({title, Svg, emoji, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        {emoji && <div className={styles.featureEmoji}>{emoji}</div>}
        {Svg && <Svg className={styles.featureSvg} role="img" />}
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
