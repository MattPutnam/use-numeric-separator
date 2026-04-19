# use-numeric-separator

A typescript-eslint rule that enforces underscore numeric separators on long number literals. In TypeScript and modern JavaScript, it is legal for number literals to contain underscores as readability aids:

```typescript
const x = 1000000000; // 100 million? 1 billion? 10 billion?
const y = 1_000_000_000; // ah, much better
```

The rule flags long literals that omit the separator (or group it at a non-canonical position) and auto-fixes them to the correctly grouped form. It supports all four numeric bases with independent configuration per base:

```typescript
const binary = 0b0110_1001;
const octal = 0o12_345_670;
const hex = 0xDEAD_BEEF;
const decimal = 1_234_567;
```

For decimal literals with a fractional part or exponent, each digit run (integer, fractional, exponent) is grouped independently by the same rules — a separator is never placed across `.`, `e`/`E`, a sign, or a BigInt `n` suffix.

## Installation

```bash
npm install --save-dev use-numeric-separator eslint @typescript-eslint/parser
```

## Usage

### Flat config (ESLint 9)

```js
// eslint.config.mjs
import useNumericSeparator from "use-numeric-separator";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { parser: tsParser },
    plugins: { "use-numeric-separator": useNumericSeparator },
    rules: {
      "use-numeric-separator/use-numeric-separator": "error",
    },
  },
];
```

### Legacy config (ESLint 8, `.eslintrc.*`)

```json
{
  "plugins": ["use-numeric-separator"],
  "parser": "@typescript-eslint/parser",
  "rules": {
    "use-numeric-separator/use-numeric-separator": "error"
  }
}
```

With no options, the rule enables all four bases at a digit threshold of 6, grouping by 3 for decimal/octal and by 4 for hex/binary.

## Options

The rule accepts an options object with four independent per-base entries (`decimal`, `hex`, `binary`, `octal`). Each entry has three optional fields:

| Field       | Type    | Default (dec/oct) | Default (hex/bin) | Description                                                                 |
|-------------|---------|-------------------|-------------------|-----------------------------------------------------------------------------|
| `enabled`   | boolean | `true`            | `true`            | When `false`, literals of this base are never reported.                      |
| `threshold` | integer | `6`               | `6`               | Digit count at or above which separators are required. Must be `>= groupSize + 1`. |
| `groupSize` | integer | `3`               | `4`               | Number of digits between separators, counted from the right. Must be `>= 2`. |

Omitted bases inherit full defaults. Omitted fields within a supplied base entry inherit individual defaults.

### Example: per-base configuration

```js
{
  "use-numeric-separator/use-numeric-separator": ["error", {
    // Disable enforcement on hex literals (e.g. preserve a team bitfield style)
    hex: { enabled: false },

    // Stricter decimal: require separators from 4 digits up
    decimal: { threshold: 4 },

    // Group binary by 2 instead of 4
    binary: { groupSize: 2 }

    // octal omitted ⇒ defaults apply
  }]
}
```

### Invalid configurations

The rule validates options at ESLint config-load time. The following fail fast with a clear error and prevent the rule from running:

- `groupSize < 2`.
- `threshold < 3`.
- `threshold < groupSize + 1` (no interior position for a separator to appear).
- Unknown per-base fields or unknown base keys.
- Wrong types (e.g. a string where a number is expected).

## Rule behavior

- **Autofix (`--fix`)**: violating literals are rewritten automatically. The fix is provably value-preserving — numeric value, base, BigInt-ness, fractional precision, and exponent are unchanged.
- **One violation per literal**: a decimal like `1234567.1234567e1234567` reports once, and its autofix rewrites all three too-long runs in a single edit.
- **`messageId`s**: `missingNumericSeparatorDecimal`, `missingNumericSeparatorHex`, `missingNumericSeparatorBinary`, `missingNumericSeparatorOctal` — stable across patch releases; use these for directive-comment suppressions and tooling.
- **BigInt literals**: the `n` suffix is preserved and never has a separator placed immediately before it.
- **Idempotent**: running autofix on already-correctly-grouped source produces zero edits.

## License

MIT.
