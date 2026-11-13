// Minimal React stub for unit-testing hooks in src/hooks/ without React,
// a DOM, or @testing-library — none of which this repo installs.
//
// Only the two hooks the ISO hooks use are provided. useState returns the
// initial value plus a setter that records every call; useEffect records
// the effect callback instead of running it, so a test decides when (and
// whether, relative to the cleanup) the effect runs. Tests import this
// same module instance to inspect and reset the recorded state, and a
// resolve hook (see use-iso-index.test.mjs) maps the bare specifier
// 'react' here.

export const hookState = {
  /** Every value passed to a useState setter, in call order. */
  sets: [],
  /** The most recent effect callback passed to useEffect. */
  effect: null,
  /** The dependency array passed alongside that effect. */
  deps: null,
};

export function useState(initial) {
  return [
    initial,
    (value) => {
      hookState.sets.push(value);
    },
  ];
}

export function useEffect(effect, deps) {
  hookState.effect = effect;
  hookState.deps = deps;
}

export function resetHookState() {
  hookState.sets = [];
  hookState.effect = null;
  hookState.deps = null;
}

export default {useState, useEffect};
