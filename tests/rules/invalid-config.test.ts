import { test } from "node:test";
import assert from "node:assert/strict";
import { Linter } from "eslint";
import { rule } from "../../src/rules/use-numeric-separator";

function lintWithOptions(options: unknown): Linter.LintMessage[] {
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

test("US4 AS7: threshold not strictly greater than groupSize throws config error", () => {
  assert.throws(
    () => lintWithOptions({ decimal: { threshold: 3, groupSize: 3 } }),
    (err: Error) => {
      // Message must name the base and the offending fields
      assert.ok(
        err.message.includes("decimal"),
        `expected 'decimal' in error, got: ${err.message}`,
      );
      assert.ok(
        err.message.includes("threshold") && err.message.includes("groupSize"),
        `expected 'threshold' and 'groupSize' in error, got: ${err.message}`,
      );
      return true;
    },
  );
});

test("US4 AS8: groupSize below minimum of 2 throws config error", () => {
  assert.throws(
    () => lintWithOptions({ hex: { groupSize: 1 } }),
    (err: Error) => {
      assert.ok(err.message.length > 0);
      return true;
    },
  );
});

test("threshold below minimum of 3 throws config error", () => {
  assert.throws(() => lintWithOptions({ binary: { threshold: 2 } }));
});

test("valid config produces no config errors on clean source", () => {
  // Should not throw and should produce no lint messages
  const msgs = lintWithOptions({ decimal: { threshold: 4, groupSize: 3 } });
  for (const m of msgs) {
    assert.ok(!m.fatal, `unexpected fatal: ${m.message}`);
  }
});
