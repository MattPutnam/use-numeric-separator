import { rule } from "../../src/rules/use-numeric-separator";
import { makeRuleTester } from "./setup";

const ruleTester = makeRuleTester();

// SC-004: 12-dimension matrix (4 bases × 3 fields). Each test isolates one
// dimension changed from defaults; non-interference is verified by including
// another-base literals that MUST remain silent.
//
// Note: the cross-field invariant (threshold >= groupSize + 1) constrains the
// minimum legal threshold per base. Defaults: decimal/octal groupSize=3 → min
// threshold 4; hex/binary groupSize=4 → min threshold 5.

ruleTester.run("use-numeric-separator [per-base-config]", rule, {
  valid: [
    // decimal.enabled: false (US4 AS1 for the decimal side)
    {
      code: "const a = 1000000000; const b = 0xFF;",
      options: [{ decimal: { enabled: false } }],
    },
    // decimal.threshold: 4 — literal just below custom threshold
    { code: "const a = 123;", options: [{ decimal: { threshold: 4 } }] },
    // hex.enabled: false
    {
      code: "const a = 0xDEADBEEFCAFE; const b = 0o777;",
      options: [{ hex: { enabled: false } }],
    },
    // hex.threshold: 5 — just below
    { code: "const a = 0xABCD;", options: [{ hex: { threshold: 5 } }] },
    // binary.enabled: false
    {
      code: "const a = 0b1010101010101010; const b = 0o777;",
      options: [{ binary: { enabled: false } }],
    },
    // binary.threshold: 5 — just below
    { code: "const a = 0b1010;", options: [{ binary: { threshold: 5 } }] },
    // octal.enabled: false
    {
      code: "const a = 0o12345670; const b = 0xFF;",
      options: [{ octal: { enabled: false } }],
    },
    // octal.threshold: 4 — just below
    { code: "const a = 0o123;", options: [{ octal: { threshold: 4 } }] },
    // Non-interference: disabling decimal does not affect hex at defaults
    { code: "const a = 0xFF;", options: [{ decimal: { enabled: false } }] },
    // Partial-config inheritance: { decimal: { threshold: 4 } } preserves hex
    // defaults — short hex remains silent.
    { code: "const x = 0xFF;", options: [{ decimal: { threshold: 4 } }] },
  ],
  invalid: [
    // US4 AS2: decimal.threshold: 4 catches `1234`
    {
      code: "const a = 1234;",
      output: "const a = 1_234;",
      options: [{ decimal: { threshold: 4 } }],
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // decimal.groupSize: 2 (threshold 3 to satisfy cross-field)
    {
      code: "const a = 123456;",
      output: "const a = 12_34_56;",
      options: [{ decimal: { groupSize: 2, threshold: 3 } }],
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // US4 AS4: hex.groupSize: 2 (threshold 3 to satisfy cross-field)
    {
      code: "const a = 0xDEADBEEF;",
      output: "const a = 0xDE_AD_BE_EF;",
      options: [{ hex: { groupSize: 2, threshold: 3 } }],
      errors: [{ messageId: "missingNumericSeparatorHex" }],
    },
    // hex.threshold: 5 (default groupSize 4 stays, 5 >= 4+1 ✓)
    {
      code: "const a = 0xABCDE;",
      output: "const a = 0xA_BCDE;",
      options: [{ hex: { threshold: 5 } }],
      errors: [{ messageId: "missingNumericSeparatorHex" }],
    },
    // binary.threshold: 5 (default groupSize 4)
    {
      code: "const a = 0b10101;",
      output: "const a = 0b1_0101;",
      options: [{ binary: { threshold: 5 } }],
      errors: [{ messageId: "missingNumericSeparatorBinary" }],
    },
    // binary.groupSize: 2 (threshold 3 to satisfy cross-field)
    {
      code: "const a = 0b11001100;",
      output: "const a = 0b11_00_11_00;",
      options: [{ binary: { groupSize: 2, threshold: 3 } }],
      errors: [{ messageId: "missingNumericSeparatorBinary" }],
    },
    // octal.threshold: 4 (default groupSize 3)
    {
      code: "const a = 0o1234;",
      output: "const a = 0o1_234;",
      options: [{ octal: { threshold: 4 } }],
      errors: [{ messageId: "missingNumericSeparatorOctal" }],
    },
    // octal.groupSize: 2 (threshold 3 to satisfy cross-field)
    {
      code: "const a = 0o123456;",
      output: "const a = 0o12_34_56;",
      options: [{ octal: { groupSize: 2, threshold: 3 } }],
      errors: [{ messageId: "missingNumericSeparatorOctal" }],
    },
    // US4 AS1: hex disabled + long decimal reports only decimal
    {
      code: "const a = 0xDEADBEEFCAFE; const b = 1000000000;",
      output: "const a = 0xDEADBEEFCAFE; const b = 1_000_000_000;",
      options: [{ hex: { enabled: false } }],
      errors: [{ messageId: "missingNumericSeparatorDecimal" }],
    },
    // US4 AS5: binary enabled + decimal disabled → only binary reports
    {
      code: "const a = 0b1010101010101010; const b = 1000000000;",
      output: "const a = 0b1010_1010_1010_1010; const b = 1000000000;",
      options: [{ decimal: { enabled: false } }],
      errors: [{ messageId: "missingNumericSeparatorBinary" }],
    },
    // US4 AS6: partial config inherits defaults; long hex still flagged at default
    {
      code: "const a = 0xDEADBEEFCAFE;",
      output: "const a = 0xDEAD_BEEF_CAFE;",
      options: [{ decimal: { threshold: 4 } }],
      errors: [{ messageId: "missingNumericSeparatorHex" }],
    },
  ],
});
