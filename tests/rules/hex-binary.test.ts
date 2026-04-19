import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import { rule } from "../../src/rules/use-numeric-separator";
import { makeRuleTester } from "./setup";

const ruleTester = makeRuleTester();

ruleTester.run("use-numeric-separator [hex+binary]", rule, {
  valid: [
    // US2 AS3: short hex not flagged
    { code: "const a = 0xFF;" },
    { code: "const a = 0xABCDE;" }, // 5 hex digits, below default threshold 6
    // US2 AS2: already-correctly-separated hex not flagged
    { code: "const a = 0xDEAD_BEEF_CAFE;" },
    // US2 AS6: literal with digit count exactly equal to groupSize has no separator
    { code: "const a = 0xFFFF;" }, // 4 hex digits, default groupSize 4 → no separator
    // Short binary
    { code: "const a = 0b1010;" },
    // US2 AS5: already-correctly-separated binary not flagged
    { code: "const a = 0b1010_1010_1010_1010;" },
    // Binary exactly 4 digits → no separator
    { code: "const a = 0b1111;" },
    // Uppercase prefixes are still recognized
    { code: "const a = 0XDEAD_BEEF;" },
    { code: "const a = 0B1010_1010;" },
  ],
  invalid: [
    // US2 AS1: hex long literal flagged with suggested form
    {
      code: "const a = 0xDEADBEEFCAFE;",
      output: "const a = 0xDEAD_BEEF_CAFE;",
      errors: [{ messageId: "missingNumericSeparatorHex" }],
    },
    // Full message data (FR-011)
    {
      code: "const a = 0xDEADBEEFCAFE;",
      output: "const a = 0xDEAD_BEEF_CAFE;",
      errors: [
        {
          messageId: "missingNumericSeparatorHex",
          data: {
            base: "Hexadecimal",
            original: "0xDEADBEEFCAFE",
            suggested: "0xDEAD_BEEF_CAFE",
          },
        },
      ],
    },
    // Mixed-case hex preserves casing
    {
      code: "const a = 0xDeAdBeEfCaFe;",
      output: "const a = 0xDeAd_BeEf_CaFe;",
      errors: [{ messageId: "missingNumericSeparatorHex" }],
    },
    // US2 AS4: long binary flagged
    {
      code: "const a = 0b1010101010101010;",
      output: "const a = 0b1010_1010_1010_1010;",
      errors: [{ messageId: "missingNumericSeparatorBinary" }],
    },
    // BigInt hex exercises FR-016
    {
      code: "const a = 0xFFFFFFFFFFFFn;",
      output: "const a = 0xFFFF_FFFF_FFFFn;",
      errors: [{ messageId: "missingNumericSeparatorHex" }],
    },
    // Wrongly-grouped hex normalized
    {
      code: "const a = 0xDE_ADBEEF_CAFE;",
      output: "const a = 0xDEAD_BEEF_CAFE;",
      errors: [{ messageId: "missingNumericSeparatorHex" }],
    },
  ],
});

// FR-010 `n`-adjacency assertion (explicit substring check)
test("hex BigInt fix never places separator adjacent to 'n'", () => {
  const linter = new Linter();
  const plugin = { rules: { "use-numeric-separator": rule } };
  const result = linter.verifyAndFix("const x = 0xFFFFFFFFFFFFn;", {
    plugins: { local: plugin },
    rules: { "local/use-numeric-separator": "error" },
  });
  assert.equal(result.output, "const x = 0xFFFF_FFFF_FFFFn;");
  assert.ok(
    !result.output.includes("_n"),
    `autofix output '${result.output}' must not contain '_n'`,
  );
});
