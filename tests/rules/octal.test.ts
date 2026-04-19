import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import { rule } from "../../src/rules/use-numeric-separator";
import { makeRuleTester } from "./setup";

const ruleTester = makeRuleTester();

ruleTester.run("use-numeric-separator [octal]", rule, {
  valid: [
    // US3 AS3: short octal not flagged
    { code: "const a = 0o777;" },
    { code: "const a = 0o12345;" }, // 5 digits, below default threshold 6
    // US3 AS2: already-separated octal not flagged
    { code: "const a = 0o12_345_670;" },
    // Uppercase prefix
    { code: "const a = 0O12_345_670;" },
  ],
  invalid: [
    // US3 AS1: long octal flagged with suggested form
    {
      code: "const a = 0o12345670;",
      output: "const a = 0o12_345_670;",
      errors: [{ messageId: "missingNumericSeparatorOctal" }],
    },
    // Full message data (FR-011)
    {
      code: "const a = 0o12345670;",
      output: "const a = 0o12_345_670;",
      errors: [
        {
          messageId: "missingNumericSeparatorOctal",
          data: {
            base: "Octal",
            original: "0o12345670",
            suggested: "0o12_345_670",
          },
        },
      ],
    },
    // BigInt octal exercises FR-016
    {
      code: "const a = 0o777777777777n;",
      output: "const a = 0o777_777_777_777n;",
      errors: [{ messageId: "missingNumericSeparatorOctal" }],
    },
    // Wrongly-grouped octal normalized
    {
      code: "const a = 0o1_2_345670;",
      output: "const a = 0o12_345_670;",
      errors: [{ messageId: "missingNumericSeparatorOctal" }],
    },
  ],
});

// FR-010 `n`-adjacency assertion
test("octal BigInt fix never places separator adjacent to 'n'", () => {
  const linter = new Linter();
  const plugin = { rules: { "use-numeric-separator": rule } };
  const result = linter.verifyAndFix("const x = 0o777777777777n;", {
    plugins: { local: plugin },
    rules: { "local/use-numeric-separator": "error" },
  });
  assert.equal(result.output, "const x = 0o777_777_777_777n;");
  assert.ok(
    !result.output.includes("_n"),
    `autofix output '${result.output}' must not contain '_n'`,
  );
});
