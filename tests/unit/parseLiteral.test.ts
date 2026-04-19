import { test } from "node:test";
import assert from "node:assert/strict";
import type { TSESTree } from "@typescript-eslint/utils";
import { parseLiteral } from "../../src/core/parseLiteral";

// Minimal stub; parseLiteral only reads `raw` and the TypeScript of `value`.
function lit(raw: string, value: number | bigint | string | boolean): TSESTree.Literal {
  return { type: "Literal", raw, value } as TSESTree.Literal;
}

test("parseLiteral: returns null for non-numeric literals", () => {
  assert.equal(parseLiteral(lit('"hello"', "hello")), null);
  assert.equal(parseLiteral(lit("true", true)), null);
});

test("parseLiteral: plain decimal integer", () => {
  const p = parseLiteral(lit("42", 42));
  assert.ok(p);
  assert.equal(p.base, "decimal");
  assert.equal(p.prefix, "");
  assert.deepEqual(p.digitRuns, ["42"]);
  assert.deepEqual(p.separators, []);
  assert.equal(p.bigintSuffix, "");
});

test("parseLiteral: long decimal integer without separators", () => {
  const p = parseLiteral(lit("1000000000", 1000000000));
  assert.ok(p);
  assert.equal(p.base, "decimal");
  assert.deepEqual(p.digitRuns, ["1000000000"]);
});

test("parseLiteral: decimal with existing separators strips underscores from runs", () => {
  const p = parseLiteral(lit("1_000_000_000", 1000000000));
  assert.ok(p);
  assert.deepEqual(p.digitRuns, ["1000000000"]);
  assert.equal(p.raw, "1_000_000_000");
});

test("parseLiteral: decimal with fractional part", () => {
  const p = parseLiteral(lit("1000.5", 1000.5));
  assert.ok(p);
  assert.equal(p.base, "decimal");
  assert.deepEqual(p.digitRuns, ["1000", "5"]);
  assert.deepEqual(p.separators, ["."]);
});

test("parseLiteral: decimal with exponent", () => {
  const p = parseLiteral(lit("1e9", 1e9));
  assert.ok(p);
  assert.deepEqual(p.digitRuns, ["1", "9"]);
  assert.deepEqual(p.separators, ["e"]);
});

test("parseLiteral: decimal with fractional and signed exponent", () => {
  const p = parseLiteral(lit("1.5E-10", 1.5e-10));
  assert.ok(p);
  assert.deepEqual(p.digitRuns, ["1", "5", "10"]);
  assert.deepEqual(p.separators, [".", "E-"]);
});

test("parseLiteral: decimal with positive-signed exponent", () => {
  const p = parseLiteral(lit("1e+5", 1e5));
  assert.ok(p);
  assert.deepEqual(p.digitRuns, ["1", "5"]);
  assert.deepEqual(p.separators, ["e+"]);
});

test("parseLiteral: BigInt decimal captures n suffix", () => {
  const p = parseLiteral(lit("10000000000n", 10000000000n));
  assert.ok(p);
  assert.equal(p.base, "decimal");
  assert.deepEqual(p.digitRuns, ["10000000000"]);
  assert.equal(p.bigintSuffix, "n");
});

test("parseLiteral: leading-zero decimal treated as decimal base", () => {
  const p = parseLiteral(lit("0755", 755));
  assert.ok(p);
  assert.equal(p.base, "decimal");
  assert.deepEqual(p.digitRuns, ["0755"]);
});

test("parseLiteral: hex lowercase prefix", () => {
  const p = parseLiteral(lit("0xDEADBEEF", 0xdeadbeef));
  assert.ok(p);
  assert.equal(p.base, "hex");
  assert.equal(p.prefix, "0x");
  assert.deepEqual(p.digitRuns, ["DEADBEEF"]);
});

test("parseLiteral: hex uppercase prefix", () => {
  const p = parseLiteral(lit("0XDEADBEEF", 0xdeadbeef));
  assert.ok(p);
  assert.equal(p.base, "hex");
  assert.equal(p.prefix, "0X");
});

test("parseLiteral: hex with mixed case digits preserves case", () => {
  const p = parseLiteral(lit("0xDeAdBeEf", 0xdeadbeef));
  assert.ok(p);
  assert.deepEqual(p.digitRuns, ["DeAdBeEf"]);
});

test("parseLiteral: hex BigInt", () => {
  const p = parseLiteral(lit("0xFFFFFFFFFFFFn", 0xffffffffffffn));
  assert.ok(p);
  assert.equal(p.base, "hex");
  assert.equal(p.prefix, "0x");
  assert.deepEqual(p.digitRuns, ["FFFFFFFFFFFF"]);
  assert.equal(p.bigintSuffix, "n");
});

test("parseLiteral: short hex", () => {
  const p = parseLiteral(lit("0xFF", 0xff));
  assert.ok(p);
  assert.deepEqual(p.digitRuns, ["FF"]);
});

test("parseLiteral: binary lowercase prefix", () => {
  const p = parseLiteral(lit("0b1010101010101010", 0b1010101010101010));
  assert.ok(p);
  assert.equal(p.base, "binary");
  assert.equal(p.prefix, "0b");
  assert.deepEqual(p.digitRuns, ["1010101010101010"]);
});

test("parseLiteral: binary uppercase prefix", () => {
  const p = parseLiteral(lit("0B1010", 0b1010));
  assert.ok(p);
  assert.equal(p.base, "binary");
  assert.equal(p.prefix, "0B");
});

test("parseLiteral: short binary", () => {
  const p = parseLiteral(lit("0b1010", 0b1010));
  assert.ok(p);
  assert.deepEqual(p.digitRuns, ["1010"]);
});

test("parseLiteral: octal lowercase prefix", () => {
  const p = parseLiteral(lit("0o12345670", 0o12345670));
  assert.ok(p);
  assert.equal(p.base, "octal");
  assert.equal(p.prefix, "0o");
  assert.deepEqual(p.digitRuns, ["12345670"]);
});

test("parseLiteral: octal uppercase prefix", () => {
  const p = parseLiteral(lit("0O777", 0o777));
  assert.ok(p);
  assert.equal(p.base, "octal");
  assert.equal(p.prefix, "0O");
});

test("parseLiteral: octal BigInt", () => {
  const p = parseLiteral(lit("0o777777777777n", 0o777777777777n));
  assert.ok(p);
  assert.equal(p.base, "octal");
  assert.equal(p.bigintSuffix, "n");
  assert.deepEqual(p.digitRuns, ["777777777777"]);
});

test("parseLiteral: short octal", () => {
  const p = parseLiteral(lit("0o777", 0o777));
  assert.ok(p);
  assert.deepEqual(p.digitRuns, ["777"]);
});
