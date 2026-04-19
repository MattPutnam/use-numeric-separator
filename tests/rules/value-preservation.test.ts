import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import { rule } from "../../src/rules/use-numeric-separator";

const linter = new Linter();
const plugin = { rules: { "use-numeric-separator": rule } };
const lintConfig = {
  plugins: { local: plugin },
  rules: { "local/use-numeric-separator": "error" },
} as const;

// Evaluate a source string containing a single numeric literal expression and
// return its runtime value (number or bigint).
function evaluate(source: string): number | bigint {
  // Extract the literal from `const x = <literal>;`
  const match = /const x = (.+);/.exec(source);
  if (!match) throw new Error(`could not parse source: ${source}`);
  const literal = match[1]!;
  // Use Function constructor to evaluate; safe for test-controlled inputs only.
  return new Function(`return ${literal};`)() as number | bigint;
}

interface Fixture {
  name: string;
  before: string;
  expectedAfter: string;
}

const fixtures: readonly Fixture[] = [
  {
    name: "decimal integer",
    before: "const x = 1000000000;",
    expectedAfter: "const x = 1_000_000_000;",
  },
  {
    name: "decimal fractional",
    before: "const x = 1234567.890;",
    expectedAfter: "const x = 1_234_567.890;",
  },
  {
    name: "decimal BigInt",
    before: "const x = 10000000000n;",
    expectedAfter: "const x = 10_000_000_000n;",
  },
  {
    name: "hex",
    before: "const x = 0xDEADBEEFCAFE;",
    expectedAfter: "const x = 0xDEAD_BEEF_CAFE;",
  },
  {
    name: "hex BigInt",
    before: "const x = 0xFFFFFFFFFFFFn;",
    expectedAfter: "const x = 0xFFFF_FFFF_FFFFn;",
  },
  {
    name: "binary",
    before: "const x = 0b1010101010101010;",
    expectedAfter: "const x = 0b1010_1010_1010_1010;",
  },
  {
    name: "octal",
    before: "const x = 0o12345670;",
    expectedAfter: "const x = 0o12_345_670;",
  },
  {
    name: "octal BigInt",
    before: "const x = 0o777777777777n;",
    expectedAfter: "const x = 0o777_777_777_777n;",
  },
];

for (const f of fixtures) {
  test(`SC-003 value preservation: ${f.name}`, () => {
    const result = linter.verifyAndFix(f.before, lintConfig);
    assert.ok(result.fixed, `expected autofix to apply for ${f.before}`);
    assert.equal(result.output, f.expectedAfter);
    const beforeVal = evaluate(f.before);
    const afterVal = evaluate(result.output);
    assert.ok(
      Object.is(beforeVal, afterVal),
      `value changed for ${f.name}: ${String(beforeVal)} vs ${String(afterVal)}`,
    );
  });
}

test("SC-002 idempotency: running fix twice produces no further changes", () => {
  for (const f of fixtures) {
    const first = linter.verifyAndFix(f.before, lintConfig);
    const second = linter.verifyAndFix(first.output, lintConfig);
    assert.equal(
      second.output,
      first.output,
      `second pass changed output for ${f.name}`,
    );
    assert.equal(
      second.fixed,
      false,
      `second pass reported a fix for ${f.name}`,
    );
  }
});
