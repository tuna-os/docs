import {useState, useEffect, useCallback} from 'react';
import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import Icon, {type IconName} from '@site/src/components/Icon';

import styles from './styles.module.css';

type Project = {
  name: string;
  desc: string;
  to: string;
  icon?: IconName;
};

type ProjectCarouselProps = {
  projects: Project[];
  interval?: number;
};

export default function ProjectCarousel({projects, interval = 8000}: ProjectCarouselProps): ReactNode {
  const [index, setIndex] = useState(0);

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % projects.length);
  }, [projects.length]);

  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + projects.length) % projects.length);
  }, [projects.length]);

  useEffect(() => {
    const timer = setInterval(next, interval);
    return () => clearInterval(timer);
  }, [next, interval]);

  return (
    <div className={styles.projectCarousel}>
      <div className={styles.projectCarouselTrack}>
        {projects.map((p, i) => (
          <div
            key={p.name}
            className={styles.projectCarouselSlide}
            style={{
              opacity: i === index ? 1 : 0,
              transform: i === index ? 'translateX(0)' : 'translateX(20px)',
            }}
          >
            <div className={styles.projectCarouselCard}>
              <div className={styles.projectCarouselIcon}>
                <Icon name={p.icon || 'code'} size={28} />
              </div>
              <Heading as="h3" className={styles.projectCarouselName}>
                {p.name}
              </Heading>
              <p className={styles.projectCarouselDesc}>{p.desc}</p>
              <Link to={p.to} className={styles.projectCarouselLink}>
                Learn more
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>
      <div className={styles.projectCarouselControls}>
        <button type="button" onClick={prev} className={styles.projectCarouselArrow} aria-label="Previous">
          ‹
        </button>
        <div className={styles.projectCarouselDots}>
          {projects.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={styles.projectCarouselDot}
              style={{
                background: i === index ? 'var(--tu-accent)' : 'var(--tu-line-strong)',
              }}
              aria-label={`Go to project ${i + 1}`}
            />
          ))}
        </div>
        <button type="button" onClick={next} className={styles.projectCarouselArrow} aria-label="Next">
          ›
        </button>
      </div>
    </div>
  );
}
