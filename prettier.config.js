// Formatting config for the docs site's TypeScript/React sources
// (src/**/*.ts, src/**/*.tsx) and scripts/**/*.mjs.
//
// Settings mirror this codebase's existing style (single quotes, no
// bracket spacing) rather than Prettier's own defaults, so the file adds a
// real, checkable convention instead of one nobody follows.
module.exports = {
  singleQuote: true,
  bracketSpacing: false,
  trailingComma: 'all',
  printWidth: 100,
};
