import type {ReactNode} from 'react';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import {MATRIX_DESKTOPS, MATRIX_VARIANTS, getMatrixCell} from '@site/src/data/matrix';

import styles from './styles.module.css';

function Cell({variantId, desktopTag}: {variantId: string; desktopTag: string}): ReactNode {
  const variant = MATRIX_VARIANTS.find((v) => v.id === variantId)!;
  const cell = getMatrixCell(variant, desktopTag);

  if (!cell.available) {
    return <td className={styles.cellEmpty} aria-label="Not available">—</td>;
  }

  return (
    <td className={styles.cellAvailable}>
      <Link to={`/${variantId}`} className={styles.cellLink} title={`${variant.name} · ${desktopTag}`}>
        <span className={styles.check}>✓</span>
        <span className={styles.badges}>
          {cell.iso && <span className={styles.badge} title="Live ISO published">ISO</span>}
          {cell.hwe && <span className={styles.badge} title="Hardware-Enablement kernel variant available">HWE</span>}
          {cell.nvidia && <span className={styles.badge} title="NVIDIA driver variant available">NVIDIA</span>}
        </span>
      </Link>
    </td>
  );
}

export default function BuildMatrix(): ReactNode {
  return (
    <section className={styles.section}>
      <div className={styles.head}>
        <Heading as="h2">Every variant, every desktop</Heading>
        <p>
          What's actually built and published today — derived straight from the
          same data that drives each variant's own page, so this can't drift out
          of sync. <strong>ISO</strong> means a live installable image ships;
          otherwise it's an OCI image you can rebase onto.
        </p>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col" className={styles.cornerHeader}>Variant</th>
              {MATRIX_DESKTOPS.map((d) => (
                <th scope="col" key={d.tag} title={d.blurb}>
                  <span className={styles.deskEmoji}>{d.emoji}</span> {d.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MATRIX_VARIANTS.map((variant) => (
              <tr key={variant.id}>
                <th scope="row" className={styles.variantHeader}>
                  <Link to={`/${variant.id}`}>
                    <span className={styles.variantEmoji}>{variant.emoji}</span> {variant.name}
                  </Link>
                  <div className={styles.variantBase}>{variant.base}</div>
                </th>
                {MATRIX_DESKTOPS.map((d) => (
                  <Cell key={d.tag} variantId={variant.id} desktopTag={d.tag} />
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
