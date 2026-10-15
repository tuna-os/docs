import useIsoIndex from './useIsoIndex';

// The set of published live-ISO names. Checking against this instead of
// hand-maintained flags means download links never claim an ISO exists when it
// doesn't, or vice versa. Backed by useIsoIndex so the index is fetched and
// parsed once for every surface that reads it.
export default function useIsoNames(): Set<string> | null {
  const index = useIsoIndex();
  if (index === null) return null;
  return new Set(index.entries.keys());
}
