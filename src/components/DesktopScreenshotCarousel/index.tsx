import {useState} from 'react';
import type {ReactNode} from 'react';
import type {Desktop} from '@site/src/data/variants';
import ShotImg from '@site/src/components/ShotImg';
import {desktopShotPath} from '@site/src/components/ShotImg/screenshot-urls';

import styles from './styles.module.css';

export default function DesktopScreenshotCarousel({
  variant,
  desktops,
}: {
  variant: string;
  desktops: Desktop[];
}): ReactNode {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const visible = desktops.filter((d) => !failed[d.tag]);

  if (visible.length === 0) {
    return (
      <div className={styles.probe} aria-hidden>
        {desktops.map((d) => (
          <ShotImg
            key={d.tag}
            path={desktopShotPath(variant, d.tag)}
            alt=""
            onError={() => setFailed((f) => ({...f, [d.tag]: true}))}
            onLoad={() => setFailed((f) => (f[d.tag] ? {...f, [d.tag]: false} : f))}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.track}>
      {visible.map((d) => (
        <figure key={d.tag} className={styles.slide}>
          <ShotImg
            path={desktopShotPath(variant, d.tag)}
            alt={`${d.name} desktop on ${variant}`}
            loading="lazy"
            onError={() => setFailed((f) => ({...f, [d.tag]: true}))}
          />
          <figcaption>
            <span className={styles.emoji}>{d.emoji}</span>
            {d.name}
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
