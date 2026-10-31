import {useRef} from 'react';
import type {ReactNode} from 'react';
import type {Variant} from '@site/src/data/variants';
import Wordmark from '@site/src/components/Wordmark';
import Link from '@docusaurus/Link';

import styles from './styles.module.css';

export default function VariantCarousel({
  variants,
}: {
  variants: Variant[];
}): ReactNode {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    const track = trackRef.current;
    if (!track) return;
    const amount = track.clientWidth * 0.75;
    track.scrollBy({left: direction === 'left' ? -amount : amount, behavior: 'smooth'});
  };

  return (
    <div className={styles.wrap}>
      <button className={styles.arrow} type="button" onClick={() => scroll('left')} aria-label="Scroll left">
        ‹
      </button>
      <div className={styles.track} ref={trackRef}>
        {variants.map((v) => (
          <Link key={v.id} to={`/${v.id}`} className={styles.card}>
            <Wordmark className={styles.mark} variantId={v.id} height={48} alt={v.name} />
            <span className={styles.base}>{v.base}</span>
          </Link>
        ))}
      </div>
      <button className={styles.arrow} type="button" onClick={() => scroll('right')} aria-label="Scroll right">
        ›
      </button>
    </div>
  );
}
