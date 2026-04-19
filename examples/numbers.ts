// Flagged with defaults (decimal, 10 digits)
const billion = 1_000_000_000;

// Flagged (hex, 12 digits, default groupSize=4)
const bits = 0xDEAD_BEEF_CAFE;

// Flagged (binary, 16 digits, default groupSize=4)
const mask = 0b1010_1010_1010_1010;

// Flagged (octal, 8 digits, default groupSize=3)
const perms = 0o12_345_670;

// Not flagged (below default threshold of 6 digits)
const answer = 42;

// Not flagged (already correctly separated)
const already = 1_000_000_000;

// Flagged as INCORRECTLY separated; autofix normalizes to 1_000_000
const wrongGrouping = 1_000_000;

export { billion, bits, mask, perms, answer, already, wrongGrouping };
