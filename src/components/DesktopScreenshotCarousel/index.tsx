import {useState} from 'react';
import type {ReactNode} from 'react';
import type {Desktop} from '@site/src/data/variants';

import styles from './styles.module.css';

const SHOT_BASE = 'https://download.tunaos.org/screenshots';

function shotUrl(variant: string, tag: string): string {
  return `${SHOT_BASE}/${variant}-${tag}-latest.png`;
}

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
          <img
            key={d.tag}
            src={shotUrl(variant, d.tag)}
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
          <img
            src={shotUrl(variant, d.tag)}
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
