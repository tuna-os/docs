import type {ReactNode} from 'react';
import {useEffect, useRef, useState} from 'react';
import Link from '@docusaurus/Link';
import {MATRIX_DESKTOPS, MATRIX_VARIANTS, buildStatus} from '@site/src/data/matrix';
import type {BuildStatus} from '@site/src/data/matrix';
import type {Variant} from '@site/src/data/variants';
import {desktopLogo, markFor} from '@site/src/data/marks';
import {elapsed} from '@site/src/components/BuildPulse';
import type {IsoIndex} from '@site/src/hooks/useIsoIndex';

import styles from './styles.module.css';

function formatSize(bytes: number): string {
  const gib = bytes / 1024 ** 3;
  return gib >= 10 ? `${gib.toFixed(0)} GiB` : `${gib.toFixed(1)} GiB`;
}

/** Freshness bucket, oldest to newest. Drives one ordinal blue ramp. */
function freshness(builtAt: string | null, now: number | null): 0 | 1 | 2 | 3 {
  if (!builtAt || now === null) return 0;
  const days = (now - Date.parse(builtAt)) / 86_400_000;
  if (days <= 2) return 3;
  if (days <= 7) return 2;
  if (days <= 30) return 1;
  return 0;
}

/**
 * The sentence a cell says, in one place: used for the visible tooltip, the
 * link's accessible name and the mobile rows, so all three always agree.
 */
function describe(
  variant: Variant,
  desktop: string,
  status: BuildStatus,
  now: number | null,
): string {
  if (!status.built) return `${variant.name} · ${desktop} — not built`;
  const bits: string[] = [];
  if (status.pending) {
    // Before the live index lands — and for a reader without JavaScript — the
    // honest answer is that this pair is built and the ISO state is unknown,
    // not that no ISO exists.
    bits.push('built; live ISO state loads with the index');
  } else if (status.iso) {
    bits.push('live ISO');
    if (status.builtAt && now !== null) bits.push(`built ${elapsed(status.builtAt, now)} ago`);
    bits.push(formatSize(status.iso.size));
    if (status.builds > 1) bits.push(`${status.builds} builds in the bucket`);
  } else if (status.localOnly) {
    bits.push('local build only — no public image or ISO');
  } else {
    bits.push('OCI image, no ISO published');
  }
  if (status.arches.length) bits.push(status.arches.join(' + '));
  if (status.nvidia) bits.push('NVIDIA edition');
  if (status.hwe) bits.push('HWE kernel edition');
  return `${variant.name} · ${desktop} — ${bits.join(', ')}`;
}

type CellProps = {
  variant: Variant;
  desktop: {name: string; tag: string};
  status: BuildStatus;
  now: number | null;
  onPeek: (text: string, el: HTMLElement | null) => void;
};

function Cell({variant, desktop, status, now, onPeek}: CellProps): ReactNode {
  const label = describe(variant, desktop.name, status, now);

  if (!status.built) {
    return (
      <td className={styles.cellEmpty}>
        <span aria-hidden>·</span>
        <span className={styles.srOnly}>{label}</span>
      </td>
    );
  }

  const href = status.iso?.url;
  const age = status.builtAt && now !== null ? elapsed(status.builtAt, now) : null;
  const level = freshness(status.builtAt, now);

  const state = status.iso
    ? 'ISO'
    : status.pending
      ? 'built'
      : status.localOnly
        ? 'local'
        : 'image';
  const body = (
    <>
      <span className={styles.cellState}>{state}</span>
      {age && <span className={styles.cellAge}>{age}</span>}
      {(status.nvidia || status.hwe) && (
        <span className={styles.cellEditions} aria-hidden>
          {status.nvidia && <span className={styles.edition}>N</span>}
          {status.hwe && <span className={styles.edition}>H</span>}
        </span>
      )}
    </>
  );

  const shared = {
    className: status.iso ? styles.cellIso : styles.cellImage,
    'data-fresh': status.iso ? String(level) : undefined,
    'aria-label': label,
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => onPeek(label, e.currentTarget),
    onFocus: (e: React.FocusEvent<HTMLElement>) => onPeek(label, e.currentTarget),
    onMouseLeave: () => onPeek('', null),
    onBlur: () => onPeek('', null),
  };

  return (
    <td className={styles.cell}>
      {href ? (
        <a {...shared} href={href} download>
          {body}
        </a>
      ) : (
        <Link {...shared} to={`/${variant.id}`}>
          {body}
        </Link>
      )}
    </td>
  );
}

/**
 * Every base image against every desktop, with the release bucket's own record
 * of what shipped laid over it: which cells have a live ISO, how recently it
 * was built, and what came with it.
 *
 * Cell state is never colour alone — each one carries its own word ("ISO",
 * "image", "·") and a full sentence as its accessible name. The blue ramp is
 * an ordinal freshness scale on top of that, not the message itself.
 */
export default function BuildMatrix({index}: {index: IsoIndex | null}): ReactNode {
  const [now, setNow] = useState<number | null>(null);
  const [peek, setPeek] = useState<{text: string; x: number; y: number} | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(timer);
  }, []);

  const onPeek = (text: string, el: HTMLElement | null) => {
    if (!text || !el || !wrapRef.current) {
      setPeek(null);
      return;
    }
    const cell = el.getBoundingClientRect();
    const wrap = wrapRef.current.getBoundingClientRect();
    setPeek({
      text,
      x: cell.left - wrap.left + cell.width / 2,
      y: cell.top - wrap.top,
    });
  };

  const rows = MATRIX_VARIANTS.map((variant) => ({
    variant,
    cells: MATRIX_DESKTOPS.map((desktop) => ({
      desktop,
      status: buildStatus(variant, desktop.tag, index),
    })),
  }));

  return (
    <div className={styles.matrix} ref={wrapRef}>
      <div
        className={styles.tableWrap}
        tabIndex={0}
        role="region"
        aria-label="Build matrix: every base image against every desktop">
        <table className={styles.table}>
          <caption className={styles.srOnly}>
            Every TunaOS base image against every desktop, showing whether a live ISO is
            published and how recently it was built.
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.cornerHeader}>
                Base image
              </th>
              {MATRIX_DESKTOPS.map((d) => (
                <th scope="col" key={d.tag} className={styles.deskHeader}>
                  {desktopLogo(d.tag) && (
                    <img
                      className={styles.deskLogo}
                      src={desktopLogo(d.tag)!}
                      alt=""
                      width={18}
                      height={18}
                      loading="lazy"
                    />
                  )}
                  <span>{d.name}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({variant, cells}) => (
              <tr key={variant.id}>
                <th scope="row" className={styles.variantHeader}>
                  <span className={styles.variantInner}>
                    <img
                      className={styles.variantMark}
                      src={markFor(variant.id)}
                      alt=""
                      width={24}
                      height={24}
                      loading="lazy"
                    />
                    <span className={styles.variantNames}>
                      <Link to={`/${variant.id}`} className={styles.variantLink}>
                        {variant.name}
                      </Link>
                      <span className={styles.variantBase}>{variant.base}</span>
                    </span>
                  </span>
                </th>
                {cells.map(({desktop, status}) => (
                  <Cell
                    key={desktop.tag}
                    variant={variant}
                    desktop={desktop}
                    status={status}
                    now={now}
                    onPeek={onPeek}
                  />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {peek && (
        <span className={styles.peek} style={{left: peek.x, top: peek.y}} aria-hidden>
          {peek.text}
        </span>
      )}

      {/* Phones get the same rows as cards; the wide table hides itself there. */}
      <div className={styles.cards}>
        {rows.map(({variant, cells}) => {
          const shipped = cells.filter((c) => c.status.built);
          return (
            <article key={variant.id} className={styles.card}>
              <header className={styles.cardHead}>
                <img
                  className={styles.variantMark}
                  src={markFor(variant.id)}
                  alt=""
                  width={26}
                  height={26}
                  loading="lazy"
                />
                <span className={styles.variantNames}>
                  <Link to={`/${variant.id}`} className={styles.variantLink}>
                    {variant.name}
                  </Link>
                  <span className={styles.variantBase}>{variant.base}</span>
                </span>
              </header>
              {shipped.length === 0 ? (
                <p className={styles.cardEmpty}>Base image only — no desktop flavors.</p>
              ) : (
                <ul className={styles.cardList}>
                  {shipped.map(({desktop, status}) => {
                    const age =
                      status.builtAt && now !== null ? elapsed(status.builtAt, now) : null;
                    return (
                      <li key={desktop.tag} className={styles.cardRow}>
                        <span className={styles.cardDesktop}>
                          {desktopLogo(desktop.tag) && (
                            <img
                              className={styles.deskLogo}
                              src={desktopLogo(desktop.tag)!}
                              alt=""
                              width={16}
                              height={16}
                              loading="lazy"
                            />
                          )}
                          {desktop.name}
                        </span>
                        <span
                          className={status.iso ? styles.cardStateIso : styles.cardState}
                          data-fresh={
                            status.iso ? String(freshness(status.builtAt, now)) : undefined
                          }>
                          {status.iso
                            ? 'ISO'
                            : status.pending
                              ? 'built'
                              : status.localOnly
                                ? 'local'
                                : 'image'}
                          {age && <span className={styles.cardAge}>{age}</span>}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </article>
          );
        })}
      </div>

      <ul className={styles.legend}>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatch} data-fresh="3" aria-hidden>
            ISO
          </span>
          Live ISO, built in the last 2 days
        </li>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatch} data-fresh="1" aria-hidden>
            ISO
          </span>
          Live ISO, older than a week
        </li>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatchImage} aria-hidden>
            image
          </span>
          OCI image only — rebase onto it
        </li>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatchImage} aria-hidden>
            local
          </span>
          Build it yourself — no public image (Redfin)
        </li>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatchNone} aria-hidden>
            ·
          </span>
          Not built for this base
        </li>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatchEdition} aria-hidden>
            N
          </span>
          NVIDIA edition
        </li>
        <li className={styles.legendItem}>
          <span className={styles.legendSwatchEdition} aria-hidden>
            H
          </span>
          HWE kernel edition
        </li>
      </ul>
    </div>
  );
}
