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
npm install --save-dev use-numeric-separator eslint
```

To lint TypeScript files, also install `@typescript-eslint/parser` and `typescript`. The rule itself works on plain JavaScript with ESLint's default parser.

Requirements: Node.js `>=18.18`, ESLint `^8.57` or `^9`, and (when used) TypeScript `>=4.8.4 <6.1`.

## Usage

### Flat config (`eslint.config.*`)

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

Or use the bundled recommended config, which registers the plugin and enables the rule at `"error"`:

```js
// eslint.config.mjs
import useNumericSeparator from "use-numeric-separator";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: { parser: tsParser },
    ...useNumericSeparator.configs.recommended,
  },
];
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

**What counts as a digit:** the base prefix (`0x`, `0b`, `0o`), existing underscores, and the BigInt `n` suffix are not counted. For decimal literals, `threshold` is applied to each digit run separately: `0.1234567` is reported because its 7-digit fractional part meets the default threshold, even though its integer part is a single digit. Every run is grouped from the right, including the fractional part (`1.1234567` → `1.1_234_567`).

### Example: per-base configuration

```js
// in eslint.config.mjs, inside a config object's `rules`
rules: {
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

The rule validates options when ESLint loads it. The following fail with an error naming the problem, and the lint run stops:

- `groupSize < 2`.
- `threshold < 3`.
- `threshold < groupSize + 1` (no interior position for a separator to appear). This check is skipped for a base with `enabled: false`, since its settings are never used.
- Unknown per-base fields or unknown base keys.
- Wrong types (e.g. a string where a number is expected).
- More than one options object.

### TypeScript config typing

The options type is exported for typed configs:

```ts
import type { UseNumericSeparatorOptions } from "use-numeric-separator";

const options: UseNumericSeparatorOptions = { hex: { groupSize: 2 } };
```

## Rule behavior

- **Autofix (`--fix`)**: violating literals are rewritten automatically. The fix only adds, removes, or moves underscores, so numeric value, base, prefix casing, BigInt-ness, fractional precision, and exponent are unchanged.
- **One violation per literal**: a decimal like `1234567.1234567e1234567` reports once, and its autofix rewrites all three too-long runs in a single edit.
- **Wrong grouping is reported too**: `1_00_000_0` is reported and normalized to `1_000_000`. Literals below the threshold are never reported, however they are separated.
- **Messages**: for example, `Decimal literal '1000000' should use numeric separators: '1_000_000'.`
- **`messageId`s**: `missingNumericSeparatorDecimal`, `missingNumericSeparatorHex`, `missingNumericSeparatorBinary`, `missingNumericSeparatorOctal` — stable across patch releases; use these in `RuleTester` tests and tooling. To suppress a report, use the rule name: `// eslint-disable-next-line use-numeric-separator/use-numeric-separator`.
- **BigInt literals**: the `n` suffix is preserved and never has a separator placed immediately before it.
- **Legacy leading-zero literals** (`0755`, `0855`, valid only in sloppy-mode JavaScript) are never reported, because numeric separators are a syntax error in them.
- **Idempotent**: running autofix on already-correctly-grouped source produces zero edits.

## License

MIT.
