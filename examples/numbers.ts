// Demo input for the rule. Build first (`npm run build`), then from this
// directory run `npx eslint numbers.ts` to see reports, or add `--fix`.
// Note: `--fix` rewrites this file; restore it with `git checkout`.

// Flagged with defaults (decimal, 10 digits) → 1_000_000_000
const billion = 1000000000;

// Flagged (hex, 12 digits, default groupSize=4) → 0xDEAD_BEEF_CAFE
const bits = 0xDEADBEEFCAFE;

// Flagged (binary, 16 digits, default groupSize=4) → 0b1010_1010_1010_1010
const mask = 0b1010101010101010;

// Flagged (octal, 8 digits, default groupSize=3) → 0o12_345_670
const perms = 0o12345670;

// Not flagged (below default threshold of 6 digits)
const answer = 42;

// Not flagged (already correctly separated)
const already = 1_000_000_000;

// Flagged as INCORRECTLY separated → autofix normalizes to 1_000_000
const wrongGrouping = 1_00_000_0;

export { billion, bits, mask, perms, answer, already, wrongGrouping };
