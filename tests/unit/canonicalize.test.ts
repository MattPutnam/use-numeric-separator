import { test } from "node:test";
import assert from "node:assert/strict";
import type { TSESTree } from "@typescript-eslint/utils";
import { canonicalize } from "../../src/core/canonicalize";
import { parseLiteral } from "../../src/core/parseLiteral";
import { DEFAULT_OPTIONS } from "../../src/options/defaults";

function lit(raw: string, value: number | bigint): TSESTree.Literal {
  return { type: "Literal", raw, value } as TSESTree.Literal;
}

function roundTrip(raw: string, value: number | bigint): string {
  const p = parseLiteral(lit(raw, value));
  assert.ok(p);
  return canonicalize(p, DEFAULT_OPTIONS);
}

test("canonicalize: short decimal unchanged", () => {
  assert.equal(roundTrip("42", 42), "42");
  assert.equal(roundTrip("12345", 12345), "12345");
});

test("canonicalize: long decimal gets grouped by 3", () => {
  assert.equal(roundTrip("1000000000", 1000000000), "1_000_000_000");
  assert.equal(roundTrip("123456", 123456), "123_456");
});

test("canonicalize: already-canonical decimal unchanged", () => {
  assert.equal(roundTrip("1_000_000_000", 1000000000), "1_000_000_000");
});

test("canonicalize: hex grouped by 4", () => {
  assert.equal(roundTrip("0xDEADBEEFCAFE", 0xdeadbeefcafe), "0xDEAD_BEEF_CAFE");
});

test("canonicalize: binary grouped by 4", () => {
  assert.equal(
    roundTrip("0b1010101010101010", 0b1010101010101010),
    "0b1010_1010_1010_1010",
  );
});

test("canonicalize: octal grouped by 3", () => {
  assert.equal(roundTrip("0o12345670", 0o12345670), "0o12_345_670");
});

test("canonicalize: BigInt suffix preserved", () => {
  assert.equal(roundTrip("10000000000n", 10000000000n), "10_000_000_000n");
  assert.equal(
    roundTrip("0xFFFFFFFFFFFFn", 0xffffffffffffn),
    "0xFFFF_FFFF_FFFFn",
  );
});

test("canonicalize: no separator adjacent to BigInt n suffix", () => {
  assert.ok(!roundTrip("10000000000n", 10000000000n).includes("_n"));
  assert.ok(!roundTrip("0xFFFFFFFFFFFFn", 0xffffffffffffn).includes("_n"));
  assert.ok(
    !roundTrip("0o777777777777n", 0o777777777777n).includes("_n"),
  );
});

test("canonicalize: decimal fractional part grouped independently", () => {
  // Integer below threshold, fractional above → fractional gets grouped.
  // Value arg is a dummy (parseLiteral only consumes `raw`).
  assert.equal(roundTrip("1.1234567", 0), "1.1_234_567");
});

test("canonicalize: decimal exponent digits grouped independently", () => {
  // Integer below threshold, exponent above → exponent gets grouped.
  // Value arg is a dummy (parseLiteral only consumes `raw`).
  assert.equal(roundTrip("1e1234567", 0), "1e1_234_567");
});

test("canonicalize: is idempotent", () => {
  // Round-trip a canonical form; it should not change.
  const cases: Array<[string, number | bigint]> = [
    ["1_000_000", 1000000],
    ["0xDEAD_BEEF_CAFE", 0xdeadbeefcafe],
    ["0b1010_1010_1010_1010", 0b1010101010101010],
    ["0o12_345_670", 0o12345670],
    ["10_000_000_000n", 10000000000n],
  ];
  for (const [raw, value] of cases) {
    const first = roundTrip(raw, value);
    const p = parseLiteral(lit(first, value));
    assert.ok(p);
    const second = canonicalize(p, DEFAULT_OPTIONS);
    assert.equal(second, first);
  }
});
