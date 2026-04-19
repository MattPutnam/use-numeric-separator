import { rule } from "../../src/rules/use-numeric-separator";
import { makeRuleTester } from "./setup";

const ruleTester = makeRuleTester();

ruleTester.run("use-numeric-separator [decimal]", rule, {
  valid: [
    // Below default threshold (6)
    { code: "const x = 42;" },
    { code: "const x = 12345;" },
    // Exactly at threshold but fewer than groupSize + 1? threshold=6, groupSize=3 means 6 digits need grouping.
    // Correctly grouped literals
    { code: "const x = 123_456;" },
    { code: "const x = 1_000_000_000;" },
    { code: "const x = 10_000_000_000n;" },
    // Fractional below threshold
    { code: "const x = 1.5;" },
    // Fractional with long integer part correctly grouped
    { code: "const x = 1_234_567.5;" },
    // Exponent below threshold
    { code: "const x = 1e9;" },
    // With explicit defaults
    {
      code: "const x = 42;",
      options: [{ decimal: { threshold: 6, groupSize: 3 } }],
    },
  ],
  invalid: [
    // US1 AS1: long decimal unseparated
    {
      code: "const x = 1000000000;",
      output: "const x = 1_000_000_000;",
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // US1 AS4: exactly 6 digits
    {
      code: "const x = 123456;",
      output: "const x = 123_456;",
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // US1 AS6 (wrongly grouped); Edge Case: separators at non-default positions
    {
      code: "const x = 1_00_000_0;",
      output: "const x = 1_000_000;",
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // Message contains suggested form (FR-011)
    {
      code: "const x = 1000000;",
      output: "const x = 1_000_000;",
      errors: [
        {
          messageId: "missingNumericSeparatorDecimal",
          data: {
            base: "Decimal",
            original: "1000000",
            suggested: "1_000_000",
          },
        },
      ],
    },
    // BigInt decimal (FR-016) + FR-010 n-adjacency (no _n)
    {
      code: "const x = 10000000000n;",
      output: "const x = 10_000_000_000n;",
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // Fractional part over threshold (FR-017)
    {
      code: "const x = 1.1234567;",
      output: "const x = 1.1_234_567;",
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // Exponent digits over threshold (FR-017)
    {
      code: "const x = 1e1234567;",
      output: "const x = 1e1_234_567;",
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // Long integer part WITH fractional + exponent: one violation per literal (FR-017)
    {
      code: "const x = 1234567.89e5;",
      output: "const x = 1_234_567.89e5;",
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
  ],
});

// FR-010 `n`-adjacency assertion: explicit substring check on the autofix output.
import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";

test("decimal BigInt fix never places separator adjacent to 'n'", () => {
  const linter = new Linter();
  const plugin = { rules: { "use-numeric-separator": rule } };
  const result = linter.verifyAndFix("const x = 10000000000n;", {
    plugins: { local: plugin },
    rules: { "local/use-numeric-separator": "error" },
  });
  assert.equal(result.output, "const x = 10_000_000_000n;");
  assert.ok(
    !result.output.includes("_n"),
    `autofix output '${result.output}' must not contain '_n'`,
  );
});
