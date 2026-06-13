import {useState} from 'react';
import type {ReactNode} from 'react';
import Heading from '@theme/Heading';
import type {Desktop} from '@site/src/data/variants';

import styles from './styles.module.css';

// Public base for the booted-desktop screenshots produced weekly by the
// tunaOS `weekly-qcow2-screenshots.yml` workflow (variant × desktop, booted in
// QEMU and screendumped). The workflow uploads them to R2 at
// screenshots/<variant>-<flavor>-latest.png, served from download.tunaos.org.
const SHOT_BASE = 'https://download.tunaos.org/screenshots';

function shotUrl(variant: string, tag: string): string {
  return `${SHOT_BASE}/${variant}-${tag}-latest.png`;
}

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
    <section className={styles.section}>
      <div className="container">
        <div className={styles.head}>
          <Heading as="h2">See the desktops</Heading>
          <p>Real screenshots, captured automatically each week by booting every desktop in a VM.</p>
        </div>
        <div className={styles.grid}>
          {visible.map((d) => (
            <figure key={d.tag} className={styles.shot}>
              <img
                src={shotUrl(variant, d.tag)}
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
