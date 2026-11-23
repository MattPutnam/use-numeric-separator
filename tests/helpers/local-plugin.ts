import type { ESLint } from "eslint";
import { rule } from "../../src/rules/use-numeric-separator";

// typescript-eslint's RuleModule and ESLint core's RuleDefinition are
// structurally incompatible types for the same runtime object (a known
// cross-package mismatch), so the cast is isolated here.
export const localPlugin = {
  rules: { "use-numeric-separator": rule },
} as unknown as ESLint.Plugin;
