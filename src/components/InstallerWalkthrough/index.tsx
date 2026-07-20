import {useState} from 'react';
import type {ReactNode} from 'react';
import Heading from '@theme/Heading';

import styles from './styles.module.css';

// Real installer-flow captures, published weekly by tunaOS's
// installer-screenshots.yml workflow (QEMU boots a fresh live ISO, drives the
// installer, screendumps every step, uploads to R2). Same graceful-404
// pattern as DesktopScreenshots: steps that aren't published yet are hidden,
// and if a whole flow is missing the section disappears.
const SHOT_BASE = 'https://download.tunaos.org/screenshots/installer';

export type WalkthroughStep = {
  file: string; // e.g. "01_welcome"
  title: string;
  blurb: string;
};

export const DEFAULT_STEPS: WalkthroughStep[] = [
  {file: '01_welcome', title: 'Welcome', blurb: 'Your variant greets you — install, or keep exploring the live desktop.'},
  {file: '02_disk_select', title: 'Pick a disk', blurb: 'Choose the target drive and partitioning options.'},
  {file: '03_confirm', title: 'Confirm', blurb: 'One last look before anything touches the disk.'},
  {file: '04_installing', title: 'Installing', blurb: 'The bootc image is written to disk — no package roulette.'},
  {file: '05_installing_progress', title: 'Almost there', blurb: 'Bootloader and first-boot setup land in place.'},
  {file: '06_done', title: 'Done', blurb: 'Reboot into your new system. Updates arrive as complete images.'},
];

// installer-smoke.yml captures these for kde/cosmic/niri/xfce: an automated
// OCR-driven pass that nudges focus forward a fixed number of times and
// screenshots each resulting frame, rather than a hand-choreographed path
// through named pages. Frame count and content differ per frontend, so these
// get generic step labels instead of the semantic ones above — captioning
// them as "Disk Selection" etc. would claim a match to the actual on-screen
// content that OCR alone cannot guarantee.
export function numberedSteps(count: number): WalkthroughStep[] {
  return Array.from({length: count}, (_, i) => {
    const n = String(i).padStart(2, '0');
    return {
      file: n,
      title: i === 0 ? 'Launch' : `Step ${i}`,
      blurb: i === 0
        ? 'The installer frontend on first render.'
        : 'Captured after nudging focus to the next control and activating it.',
    };
  });
}

function shotUrl(prefix: string, file: string): string {
  return `${SHOT_BASE}/${prefix}${file}-latest.png`;
}

export default function InstallerWalkthrough({
  title = 'The install, step by step',
  subtitle = 'Captured automatically from a real ISO boot every week — what you see is what ships.',
  prefix = '', // '' = default flow, 'cosmic_' = COSMIC flow
  steps = DEFAULT_STEPS,
}: {
  title?: string;
  subtitle?: string;
  prefix?: string;
  steps?: WalkthroughStep[];
}): ReactNode {
  const [failed, setFailed] = useState<Record<string, boolean>>({});
  const [active, setActive] = useState(0);
  const visible = steps.filter((s) => !failed[s.file]);
  const current = visible[Math.min(active, Math.max(visible.length - 1, 0))];

  // Probe images regardless so late-published steps appear without a reload.
  const probes = (
    <div className={styles.probe} aria-hidden>
      {steps.map((s) => (
        <img
          key={s.file}
          src={shotUrl(prefix, s.file)}
          alt=""
          onError={() => setFailed((f) => ({...f, [s.file]: true}))}
          onLoad={() => setFailed((f) => (f[s.file] ? {...f, [s.file]: false} : f))}
        />
      ))}
    </div>
  );

  if (visible.length === 0 || !current) {
    return probes;
  }

  return (
    <section className={styles.section}>
      {probes}
      <div className={styles.head}>
        <Heading as="h2">{title}</Heading>
        <p>{subtitle}</p>
      </div>

      <figure className={styles.stage}>
        <img
          src={shotUrl(prefix, current.file)}
          alt={current.title}
          loading="lazy"
        />
        <figcaption>
          <strong>
            {visible.indexOf(current) + 1}/{visible.length} · {current.title}
          </strong>
          <span>{current.blurb}</span>
        </figcaption>
      </figure>

      <div className={styles.strip} role="tablist" aria-label="Installer steps">
        {visible.map((s, i) => (
          <button
            key={s.file}
            role="tab"
            aria-selected={i === active}
            className={i === active ? styles.thumbActive : styles.thumb}
            onClick={() => setActive(i)}
            title={s.title}
          >
            <img src={shotUrl(prefix, s.file)} alt={s.title} loading="lazy" />
            <span>{s.title}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
