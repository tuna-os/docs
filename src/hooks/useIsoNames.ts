import {useEffect, useState} from 'react';
import useBaseUrl from '@docusaurus/useBaseUrl';

// Fetches the live ISO index (static/iso-index.json, built from a real
// `rclone lsjson` of the R2 bucket — see scripts/build-iso-index.mjs) and
// exposes the set of published live-ISO names. Checking against this
// instead of hand-maintained flags/exclusion lists means download links
// never claim an ISO exists when it doesn't, or vice versa.
export default function useIsoNames(): Set<string> | null {
  const indexUrl = useBaseUrl('/iso-index.json');
  const [names, setNames] = useState<Set<string> | null>(null);

  useEffect(() => {
    let live = true;
    fetch(indexUrl, {cache: 'no-cache'})
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((data: {categories: {id: string; isos: {name: string}[]}[]}) => {
        if (!live) return;
        const cat = data.categories.find((c) => c.id === 'live-isos');
        setNames(new Set((cat?.isos ?? []).map((i) => i.name)));
      })
      .catch(() => live && setNames(new Set()));
    return () => {
      live = false;
    };
  }, [indexUrl]);

  return names;
}
