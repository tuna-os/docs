import {useCallback, useEffect, useRef, useState} from 'react';
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

/**
 * Featured-project carousel.
 *
 * The slides used to be stacked absolutely and cross-faded by JS inside a
 * track of fixed height. On a phone that failed twice over: the card was
 * taller than the track, so its text was clipped, and a swipe did nothing
 * because the track never scrolled. It is a scroll-snap track now — the
 * browser handles the swipe, the momentum and the snapping, and the height
 * comes from the tallest card rather than from a guess. JS only auto-advances
 * and keeps the dots in step, and it stands down as soon as a person takes
 * over.
 */
export default function ProjectCarousel({projects, interval = 8000}: ProjectCarouselProps): ReactNode {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const scrollTo = useCallback((i: number, behavior: ScrollBehavior = 'smooth') => {
    const track = trackRef.current;
    if (!track) return;
    const slide = track.children[i] as HTMLElement | undefined;
    if (slide) track.scrollTo({left: slide.offsetLeft - track.offsetLeft, behavior});
  }, []);

  // Scroll position is the source of truth for which slide is current, so a
  // swipe, a dot and the timer all agree on it.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const width = track.clientWidth || 1;
        setIndex(Math.min(projects.length - 1, Math.round(track.scrollLeft / width)));
      });
    };
    track.addEventListener('scroll', onScroll, {passive: true});
    return () => {
      cancelAnimationFrame(frame);
      track.removeEventListener('scroll', onScroll);
    };
  }, [projects.length]);

  useEffect(() => {
    if (paused) return undefined;
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }
    const timer = setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const width = track.clientWidth || 1;
      const current = Math.round(track.scrollLeft / width);
      scrollTo((current + 1) % projects.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, paused, projects.length, scrollTo]);

  const step = (delta: number) => {
    setPaused(true);
    scrollTo((index + delta + projects.length) % projects.length);
  };

  return (
    <div
      className={styles.carousel}
      onPointerDown={() => setPaused(true)}
      onFocusCapture={() => setPaused(true)}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div
        className={styles.track}
        ref={trackRef}
        tabIndex={0}
        role="group"
        aria-label="Featured projects"
      >
        {projects.map((p) => (
          <div className={styles.slide} key={p.name}>
            <div className={styles.card}>
              <div className={styles.icon}>
                <Icon name={p.icon || 'code'} size={26} />
              </div>
              <Heading as="h3" className={styles.name}>
                {p.name}
              </Heading>
              <p className={styles.desc}>{p.desc}</p>
              <Link to={p.to} className={styles.link}>
                Learn more
                <Icon name="arrow-right" size={14} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.controls}>
        <button
          type="button"
          onClick={() => step(-1)}
          className={styles.arrow}
          aria-label="Previous project">
          ‹
        </button>
        <div className={styles.dots}>
          {projects.map((p, i) => (
            <button
              key={p.name}
              type="button"
              onClick={() => {
                setPaused(true);
                scrollTo(i);
              }}
              className={i === index ? `${styles.dot} ${styles.dotActive}` : styles.dot}
              aria-label={`Show ${p.name}`}
              aria-current={i === index ? 'true' : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={() => step(1)}
          className={styles.arrow}
          aria-label="Next project">
          ›
        </button>
      </div>
    </div>
  );
}
