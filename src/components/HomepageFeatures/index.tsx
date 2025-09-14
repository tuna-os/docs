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
        Experience GNOME 48.3 on Enterprise Linux - don't get stuck on 3-year-old 
        desktop environments. We backport the latest features to Enterprise Linux.
      </>
    ),
  },
  {
    title: 'Bootc Container Technology',
    emoji: '📦',
    description: (
      <>
        Built on modern bootc container technology for immutable, reliable systems.
        Easy updates, rollbacks, and customization through container images.
      </>
    ),
  },
  {
    title: 'Multiple Base Images',
    emoji: '🐠',
    description: (
      <>
        Choose from AlmaLinux, AlmaLinux Kitten, Fedora, or CentOS bases.
        Each variant optimized for specific use cases and compatibility needs.
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
