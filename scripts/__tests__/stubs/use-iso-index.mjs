// Stub for src/hooks/useIsoIndex.ts, mapped by the resolve hook in
// use-iso-names.test.mjs when useIsoNames.ts imports './useIsoIndex'.
// Tests set `holder.current` to the index (or null, while loading) that
// the stubbed hook should report.

export const holder = {current: null};

export default function useIsoIndex() {
  return holder.current;
}
