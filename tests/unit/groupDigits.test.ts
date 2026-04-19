import { test } from "node:test";
import assert from "node:assert/strict";
import { groupDigits } from "../../src/core/groupDigits";

test("groupDigits: returns input unchanged when length <= groupSize", () => {
  assert.equal(groupDigits("100", 3), "100");
  assert.equal(groupDigits("12", 3), "12");
  assert.equal(groupDigits("", 3), "");
  assert.equal(groupDigits("FFFF", 4), "FFFF");
});

test("groupDigits: groups by 3 from the right", () => {
  assert.equal(groupDigits("1000", 3), "1_000");
  assert.equal(groupDigits("12345", 3), "12_345");
  assert.equal(groupDigits("123456", 3), "123_456");
  assert.equal(groupDigits("1234567", 3), "1_234_567");
  assert.equal(groupDigits("1000000", 3), "1_000_000");
  assert.equal(groupDigits("1234567890", 3), "1_234_567_890");
});

test("groupDigits: groups by 4 from the right", () => {
  assert.equal(groupDigits("FFFFF", 4), "F_FFFF");
  assert.equal(groupDigits("DEADBEEF", 4), "DEAD_BEEF");
  assert.equal(groupDigits("DEADBEEFCAFE", 4), "DEAD_BEEF_CAFE");
  assert.equal(groupDigits("1010101010101010", 4), "1010_1010_1010_1010");
});

test("groupDigits: groups by 2 from the right", () => {
  assert.equal(groupDigits("DEADBEEF", 2), "DE_AD_BE_EF");
  assert.equal(groupDigits("123456", 2), "12_34_56");
  assert.equal(groupDigits("11001100", 2), "11_00_11_00");
});

test("groupDigits: preserves hex letter case", () => {
  assert.equal(groupDigits("DeAdBeEf", 4), "DeAd_BeEf");
  assert.equal(groupDigits("abcdef12345", 4), "abc_def1_2345");
});

test("groupDigits: throws on invalid groupSize", () => {
  assert.throws(() => groupDigits("1000", 1), RangeError);
  assert.throws(() => groupDigits("1000", 0), RangeError);
  assert.throws(() => groupDigits("1000", -1), RangeError);
  assert.throws(() => groupDigits("1000", 2.5), RangeError);
});
