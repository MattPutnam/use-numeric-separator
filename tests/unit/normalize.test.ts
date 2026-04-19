import { test } from "node:test";
import assert from "node:assert/strict";
import { normalize } from "../../src/options/normalize";
import { DEFAULT_OPTIONS } from "../../src/options/defaults";

test("normalize: empty options fills all defaults", () => {
  const r = normalize({}, DEFAULT_OPTIONS);
  assert.deepEqual(r, DEFAULT_OPTIONS);
});

test("normalize: undefined options fills all defaults", () => {
  const r = normalize(undefined, DEFAULT_OPTIONS);
  assert.deepEqual(r, DEFAULT_OPTIONS);
});

test("normalize: single base override leaves others at defaults", () => {
  const r = normalize({ decimal: { threshold: 10 } }, DEFAULT_OPTIONS);
  assert.equal(r.decimal.threshold, 10);
  assert.equal(r.decimal.groupSize, 3); // default
  assert.equal(r.decimal.enabled, true); // default
  assert.deepEqual(r.hex, DEFAULT_OPTIONS.hex);
  assert.deepEqual(r.binary, DEFAULT_OPTIONS.binary);
  assert.deepEqual(r.octal, DEFAULT_OPTIONS.octal);
});

test("normalize: partial per-base override preserves unmentioned fields", () => {
  const r = normalize({ hex: { enabled: false } }, DEFAULT_OPTIONS);
  assert.equal(r.hex.enabled, false);
  assert.equal(r.hex.threshold, 6);
  assert.equal(r.hex.groupSize, 4);
});

test("normalize: throws when threshold <= groupSize", () => {
  assert.throws(
    () =>
      normalize({ decimal: { threshold: 3, groupSize: 3 } }, DEFAULT_OPTIONS),
    (err: Error) => {
      assert.ok(err instanceof TypeError);
      assert.ok(err.message.includes("decimal"));
      assert.ok(err.message.includes("threshold"));
      assert.ok(err.message.includes("groupSize"));
      return true;
    },
  );
});

test("normalize: throws when threshold == groupSize for hex", () => {
  assert.throws(
    () => normalize({ hex: { threshold: 4, groupSize: 4 } }, DEFAULT_OPTIONS),
    (err: Error) => {
      assert.ok(err instanceof TypeError);
      assert.ok(err.message.includes("hex"));
      return true;
    },
  );
});

test("normalize: accepts threshold exactly groupSize + 1", () => {
  const r = normalize(
    { decimal: { threshold: 4, groupSize: 3 } },
    DEFAULT_OPTIONS,
  );
  assert.equal(r.decimal.threshold, 4);
  assert.equal(r.decimal.groupSize, 3);
});

test("normalize: cross-field check uses default for unprovided field", () => {
  // threshold defaults to 6; if user sets groupSize to 6, 6 >= 6+1 is false → throw.
  assert.throws(
    () => normalize({ decimal: { groupSize: 6 } }, DEFAULT_OPTIONS),
    TypeError,
  );
});
