import {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

// The live ISO index (static/iso-index.json) is built from a real
// `rclone lsjson` of the release bucket by scripts/build-iso-index.mjs and
// refreshed by update-iso-index.yml, so it is the closest thing the site has
// to the pipeline's own record of what shipped and when. useIsoNames answers
// "does this ISO exist"; this hook keeps the rest — build time, size, the
// arch- and edition-suffixed siblings — for surfaces that show build state.

export type IsoEntry = {
  name: string;
  url: string;
  size: number;
  /** ISO 8601 timestamp of the object in the bucket: when the build landed. */
  modified: string;
  arch: string;
  latest: boolean;
};

export type IsoIndex = {
  /** Live ISOs by name, e.g. "albacore-gnome-latest". */
  entries: Map<string, IsoEntry>;
  /** Every live ISO, including the arch- and version-suffixed siblings. */
  all: IsoEntry[];
  /** When the index itself was regenerated. */
  generatedAt: string | null;
};

const EMPTY: IsoIndex = {entries: new Map(), all: [], generatedAt: null};

type RawIndex = {
  generatedAt?: string;
  categories?: {id: string; isos: IsoEntry[]}[];
};

/**
 * Returns the live ISO index, or null while it is still loading. A null is the
 * signal to render the statically-known shape of things and fill the live
 * detail in on arrival — never to render an empty page.
 */
export default function useIsoIndex(): IsoIndex | null {
  const indexUrl = useBaseUrl('/iso-index.json');
  const [index, setIndex] = useState<IsoIndex | null>(null);

  useEffect(() => {
    let live = true;
    fetch(indexUrl, {cache: 'no-cache'})
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: RawIndex) => {
        if (!live) return;
        const isos = data.categories?.find((c) => c.id === 'live-isos')?.isos ?? [];
        setIndex({
          entries: new Map(isos.map((i) => [i.name, i])),
          all: isos,
          generatedAt: data.generatedAt ?? null,
        });
      })
      .catch(() => live && setIndex(EMPTY));
    return () => {
      live = false;
    };
  }, [indexUrl]);

  return index;
}
