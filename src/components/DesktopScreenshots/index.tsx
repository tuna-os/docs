import {useState} from 'react';
import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import type {Desktop} from '@site/src/data/variants';
import ShotImg from '@site/src/components/ShotImg';
import {desktopShotPath} from '@site/src/components/ShotImg/screenshot-urls';

import styles from './styles.module.css';

// The booted-desktop screenshots come from the tunaOS weekly screenshot
// workflows (variant × desktop, booted in QEMU and screendumped). ShotImg loads
// each one from the rolling `screenshots` GitHub release and falls back to R2
// (download.tunaos.org).

// Renders the real, auto-captured desktop screenshots for a variant. Any combo
// that isn't published yet (404s) is hidden client-side; if none load, the
// whole section disappears — so the page degrades gracefully whether or not the
// weekly run has populated R2.
export default function DesktopScreenshots({
  variant,
  desktops,
}: {
  variant: string;
  desktops: Desktop[];
}): ReactNode {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const visible = desktops.filter((d) => !failed[d.tag]);

  if (visible.length === 0) {
    // Still render the (hidden) <img>s so a late-arriving screenshot can flip
    // the section back on without a reload — but show no heading/empty frame.
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
    <section className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <Heading as="h2">See the desktops</Heading>
          <p>Real screenshots, captured automatically each week by booting every desktop in a VM.</p>
        </div>
        <div className={styles.grid}>
          {visible.map((d) => (
            <figure key={d.tag} className={styles.shot}>
              <ShotImg
                path={desktopShotPath(variant, d.tag)}
                alt={`${d.name} desktop on ${variant}`}
                loading="lazy"
                onError={() => setFailed((f) => ({...f, [d.tag]: true}))}
              />
              <figcaption>{d.name}</figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
