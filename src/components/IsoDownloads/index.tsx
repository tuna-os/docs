import type {ReactNode} from 'react';
import {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';
import styles from './styles.module.css';

// Shape of static/iso-index.json (produced by scripts/build-iso-index.mjs
// from a live `rclone lsjson` of the R2 bucket).
type Iso = {
  category: string;
  name: string;
  path: string;
  url: string;
  size: number | null;
  modified: string;
  arch: string;
  latest: boolean;
};

type Category = {
  id: string;
  label: string;
  blurb: string;
  icon: string;
  checksums: string | null;
  isos: Iso[];
};

type Index = {
  generatedAt: string;
  baseUrl: string;
  count: number;
  categories: Category[];
};

function formatBytes(n: number | null): string {
  if (!n || n <= 0) return '—';
  const gib = n / (1024 * 1024 * 1024);
  if (gib >= 1) return `${gib.toFixed(2)} GiB`;
  return `${(n / (1024 * 1024)).toFixed(0)} MiB`;
}

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString(undefined, {year: 'numeric', month: 'short', day: 'numeric'});
}

// "albacore-gnome-latest" -> "Albacore · GNOME"; dated builds keep their
// stamp so the archive list stays unambiguous.
function prettyName(iso: Iso): string {
  let base = iso.name.replace(/-latest$/i, '');
  if (iso.latest) {
    return base
      .split('-')
      .map((p) => (p.toLowerCase() === 'gnome' ? 'GNOME' : p.toLowerCase() === 'kde' ? 'KDE' : p.charAt(0).toUpperCase() + p.slice(1)))
      .join(' · ');
  }
  return iso.name;
}

function IsoRow({iso}: {iso: Iso}): ReactNode {
  return (
    <a className={styles.isoRow} href={iso.url} download>
      <div className={styles.isoMain}>
        <span className={styles.isoName}>{prettyName(iso)}</span>
        <span className={styles.isoMeta}>
          {iso.arch && <span className={styles.tag}>{iso.arch}</span>}
          {iso.latest && <span className={`${styles.tag} ${styles.tagLatest}`}>latest</span>}
          {formatDate(iso.modified) && <span className={styles.isoDate}>{formatDate(iso.modified)}</span>}
        </span>
      </div>
      <div className={styles.isoRight}>
        <span className={styles.isoSize}>{formatBytes(iso.size)}</span>
        <span className={styles.isoDownload} aria-hidden>⬇</span>
      </div>
    </a>
  );
}

function CategoryCard({cat}: {cat: Category}): ReactNode {
  const latest = cat.isos.filter((i) => i.latest);
  const archives = cat.isos.filter((i) => !i.latest);
  const [showArchive, setShowArchive] = useState(false);

  return (
    <section className={styles.card}>
      <header className={styles.cardHead}>
        <span className={styles.cardIcon} aria-hidden>{cat.icon}</span>
        <div>
          <h3 className={styles.cardTitle}>{cat.label}</h3>
          {cat.blurb && <p className={styles.cardBlurb}>{cat.blurb}</p>}
        </div>
      </header>

      <div className={styles.isoList}>
        {(latest.length ? latest : []).map((iso) => ( // only latest, never all
          <IsoRow key={iso.path} iso={iso} />
        ))}
      </div>

      {archives.length > 0 && latest.length > 0 && (
        <>
          <button
            className={styles.archiveToggle}
            onClick={() => setShowArchive((v) => !v)}
            type="button"
          >
            {showArchive ? '▾' : '▸'} {archives.length} older build{archives.length === 1 ? '' : 's'}
          </button>
          {showArchive && (
            <div className={styles.isoList}>
              {archives.map((iso) => (
                <IsoRow key={iso.path} iso={iso} />
              ))}
            </div>
          )}
        </>
      )}

      {cat.checksums && (
        <a className={styles.checksums} href={cat.checksums}>
          🔐 SHA256SUMS
        </a>
      )}
    </section>
  );
}

export default function IsoDownloads(): ReactNode {
  const indexUrl = useBaseUrl('/iso-index.json');
  const [index, setIndex] = useState<Index | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let live = true;
    fetch(indexUrl, {cache: 'no-cache'})
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: Index) => live && setIndex(data))
      .catch(() => live && setError(true));
    return () => {
      live = false;
    };
  }, [indexUrl]);

  if (error) {
    return (
      <div className={styles.fallback}>
        <p>
          Couldn’t load the live download index. Browse all builds directly at{' '}
          <a href="https://download.tunaos.org">download.tunaos.org</a>.
        </p>
      </div>
    );
  }

  if (!index) {
    return (
      <div className={styles.loading}>
        <span className={styles.spinner} aria-hidden />
        <span>Loading the latest ISOs…</span>
      </div>
    );
  }

  return (
    <div>
      <div className={styles.grid}>
        {index.categories
          .filter((cat) => cat.isos.some((i) => i.latest))
          .map((cat) => (
          <CategoryCard key={cat.id} cat={cat} />
        ))}
      </div>
      <p className={styles.generated}>
        {index.categories.reduce((n, c) => n + c.isos.filter((i) => i.latest).length, 0)} latest images · refreshed {formatDate(index.generatedAt)} from{' '}
        <a href={index.baseUrl}>download.tunaos.org</a>
      </p>
    </div>
  );
}
