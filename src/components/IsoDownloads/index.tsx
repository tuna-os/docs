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
      .map((p) => {
        const l = p.toLowerCase();
        if (l === 'gnome') return 'GNOME';
        if (l === 'kde') return 'KDE';
        if (l === 'niri') return 'Niri';
        if (l === 'cosmic') return 'COSMIC';
        if (l === 'gdx') return 'NVIDIA'; // renamed
        if (l === 'nvidia') return 'NVIDIA';
        if (l === 'hwe') return 'HWE';
        if (l === 'gnome50') return 'GNOME 50';
        return p.charAt(0).toUpperCase() + p.slice(1);
      })
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

function groupByVariant(isos: Iso[]): Record<string, Iso[]> {
  const groups: Record<string, Iso[]> = {};
  for (const iso of isos) {
    // Extract variant prefix: first segment before '-' (e.g. albacore, yellowfin)
    const variant = iso.name.split('-')[0].toLowerCase();
    if (!groups[variant]) groups[variant] = [];
    groups[variant].push(iso);
  }
  return groups;
}

function VariantSection({name, isos}: {name: string; isos: Iso[]}) {
  const [open, setOpen] = useState(true);
  const label = name.charAt(0).toUpperCase() + name.slice(1);
  return (
    <div className={styles.variantSection}>
      <button
        className={styles.variantToggle}
        onClick={() => setOpen((v) => !v)}
        type="button"
        aria-expanded={open}
      >
        <span>{open ? '▾' : '▸'}</span> {label} <span className={styles.variantCount}>({isos.length})</span>
      </button>
      {open && (
        <div className={styles.isoList}>
          {isos.map((iso) => (
            <IsoRow key={iso.path} iso={iso} />
          ))}
        </div>
      )}
    </div>
  );
}

function CategoryCard({cat, query}: {cat: Category; query: string}): ReactNode {
  const latest = cat.isos.filter((i) => i.latest);
  const archives = cat.isos.filter((i) => !i.latest);
  const [showArchive, setShowArchive] = useState(false);

  const filteredLatest = query
    ? latest.filter((iso) => {
        const text = `${iso.name} ${iso.category} ${iso.arch} ${prettyName(iso)}`.toLowerCase();
        return text.includes(query);
      })
    : latest;

  const filteredArchives = query
    ? archives.filter((iso) => {
        const text = `${iso.name} ${iso.category} ${iso.arch} ${prettyName(iso)}`.toLowerCase();
        return text.includes(query);
      })
    : archives;

  // Group latest ISOs by variant prefix (e.g. albacore, yellowfin)
  const groups = groupByVariant(filteredLatest.length ? filteredLatest : []);
  const hasGroups = Object.keys(groups).length > 1;

  if (!query && !latest.length && !archives.length) {
    return null;
  }

  if (query && !filteredLatest.length && !filteredArchives.length) {
    return null;
  }

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
        {hasGroups ? (
          Object.entries(groups).map(([variant, isos]) => (
            <VariantSection key={variant} name={variant} isos={isos} />
          ))
        ) : (
          filteredLatest.map((iso) => (
            <IsoRow key={iso.path} iso={iso} />
          ))
        )}
      </div>

      {(filteredArchives.length > 0 && filteredLatest.length > 0) && !query && (
        <>
          <button
            className={styles.archiveToggle}
            onClick={() => setShowArchive((v) => !v)}
            type="button"
          >
            {showArchive ? '▾' : '▸'} {filteredArchives.length} older build{filteredArchives.length === 1 ? '' : 's'}
          </button>
          {showArchive && (
            <div className={styles.isoList}>
              {filteredArchives.map((iso) => (
                <IsoRow key={iso.path} iso={iso} />
              ))}
            </div>
          )}
        </>
      )}

      {cat.checksums && !query && (
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
  const [query, setQuery] = useState('');

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

  const q = query.trim().toLowerCase();
  const latestIsos = index.categories
    .flatMap((cat) => cat.isos.filter((i) => i.latest))
    .sort((a, b) => a.name.localeCompare(b.name));

  const filtered = q
    ? latestIsos.filter((iso) => {
        const text = `${iso.name} ${iso.category} ${iso.arch} ${prettyName(iso)}`.toLowerCase();
        return text.includes(q);
      })
    : latestIsos;

  const grouped = groupByVariant(filtered);

  return (
    <div>
      <div className={styles.searchWrap}>
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Search ISOs by variant, desktop, or arch…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {q && (
        <p className={styles.resultCount}>
          {filtered.length} result{filtered.length === 1 ? '' : 's'} for “{query}”
        </p>
      )}

      <div className={styles.grid}>
        {index.categories
          .filter((cat) => {
            if (!query) return cat.isos.some((i) => i.latest);
            return cat.isos.some((iso) => {
              const text = `${iso.name} ${iso.category} ${iso.arch} ${prettyName(iso)}`.toLowerCase();
              return text.includes(q);
            });
          })
          .map((cat) => (
          <CategoryCard key={cat.id} cat={cat} query={q} />
        ))}
      </div>

      {!q && (
        <p className={styles.generated}>
          {latestIsos.length} latest images · refreshed {formatDate(index.generatedAt)} from{' '}
          <a href={index.baseUrl}>download.tunaos.org</a>
        </p>
      )}
    </div>
  );
}
