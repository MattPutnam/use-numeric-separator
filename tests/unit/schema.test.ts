import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import { rule } from "../../src/rules/use-numeric-separator";

function runWithOptions(options: unknown): Linter.LintMessage[] {
  const linter = new Linter();
  const plugin = { rules: { "use-numeric-separator": rule } };
  return linter.verify("const x = 1;", {
    plugins: { local: plugin },
    rules: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      "local/use-numeric-separator": ["error", options as any],
    },
  });
}

// ESLint throws synchronously when the rule's JSON schema rejects the options.
// The thrown Error message names the offending field.
function expectSchemaRejection(options: unknown, fieldHint: string): void {
  assert.throws(
    () => runWithOptions(options),
    (err: Error) => {
      assert.ok(
        err.message.includes(fieldHint) ||
          err.message.includes("use-numeric-separator"),
        `expected error to mention '${fieldHint}', got: ${err.message}`,
      );
      return true;
    },
  );
}

function expectNoSchemaRejection(options: unknown): void {
  runWithOptions(options); // Should not throw
}

test("schema: rejects groupSize below minimum (2)", () => {
  expectSchemaRejection({ decimal: { groupSize: 1 } }, "groupSize");
  expectSchemaRejection({ hex: { groupSize: 0 } }, "groupSize");
});

test("schema: rejects threshold below minimum (3)", () => {
  expectSchemaRejection({ hex: { threshold: 2 } }, "threshold");
  expectSchemaRejection({ decimal: { threshold: 0 } }, "threshold");
});

test("schema: rejects non-integer values", () => {
  expectSchemaRejection({ binary: { threshold: 3.5 } }, "threshold");
  expectSchemaRejection({ octal: { groupSize: 2.5 } }, "groupSize");
});

test("schema: rejects wrong types", () => {
  expectSchemaRejection({ octal: { groupSize: "three" } }, "groupSize");
  expectSchemaRejection({ decimal: { enabled: "yes" } }, "enabled");
});

test("schema: rejects unknown base keys", () => {
  expectSchemaRejection({ quaternary: { groupSize: 4 } }, "quaternary");
});

test("schema: rejects unknown per-base fields", () => {
  expectSchemaRejection({ decimal: { unknown: 1 } }, "unknown");
});

test("schema: accepts empty options", () => {
  expectNoSchemaRejection({});
});

test("schema: accepts empty per-base entries", () => {
  expectNoSchemaRejection({ decimal: {} });
});

test("schema: accepts partial per-base entries that satisfy cross-field", () => {
  expectNoSchemaRejection({ decimal: { enabled: false } });
  expectNoSchemaRejection({ hex: { threshold: 10 } });
  // Default threshold 6; groupSize 3 keeps 6 >= 3+1=4 OK
  expectNoSchemaRejection({ binary: { groupSize: 3 } });
});

test("schema: accepts full valid configuration", () => {
  expectNoSchemaRejection({
    decimal: { enabled: true, threshold: 6, groupSize: 3 },
    hex: { enabled: false, threshold: 8, groupSize: 4 },
    binary: { enabled: true, threshold: 8, groupSize: 4 },
    octal: { enabled: true, threshold: 6, groupSize: 3 },
  });
});
