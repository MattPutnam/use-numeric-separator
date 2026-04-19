import type { TSESTree } from "@typescript-eslint/utils";
import type { Base, ParsedLiteral } from "./types";

const DECIMAL_RE =
  /^([0-9_]*)(?:\.([0-9_]*))?(?:([eE])([+-]?)([0-9_]*))?$/;

export function parseLiteral(
  node: TSESTree.Literal,
): ParsedLiteral | null {
  if (typeof node.value !== "number" && typeof node.value !== "bigint") {
    return null;
  }
  const raw = node.raw;
  if (raw.length === 0) return null;

  let rest = raw;
  let bigintSuffix: "" | "n" = "";
  if (rest.endsWith("n")) {
    bigintSuffix = "n";
    rest = rest.slice(0, -1);
  }

  let base: Base;
  let prefix = "";
  if (/^0[xX]/.test(rest)) {
    base = "hex";
    prefix = rest.slice(0, 2);
    rest = rest.slice(2);
  } else if (/^0[bB]/.test(rest)) {
    base = "binary";
    prefix = rest.slice(0, 2);
    rest = rest.slice(2);
  } else if (/^0[oO]/.test(rest)) {
    base = "octal";
    prefix = rest.slice(0, 2);
    rest = rest.slice(2);
  } else {
    base = "decimal";
  }

  if (base !== "decimal") {
    return {
      base,
      prefix,
      raw,
      digitRuns: [rest.replace(/_/g, "")],
      separators: [],
      bigintSuffix,
    };
  }

  const match = DECIMAL_RE.exec(rest);
  if (!match) return null;
  const intPart = match[1] ?? "";
  const fracPart = match[2];
  const expMarker = match[3];
  const expSign = match[4] ?? "";
  const expDigits = match[5];

  const digitRuns: string[] = [intPart.replace(/_/g, "")];
  const separators: string[] = [];

  if (fracPart !== undefined) {
    separators.push(".");
    digitRuns.push(fracPart.replace(/_/g, ""));
  }
  if (expMarker !== undefined) {
    separators.push(expMarker + expSign);
    digitRuns.push((expDigits ?? "").replace(/_/g, ""));
  }

  return {
    base,
    prefix,
    raw,
    digitRuns,
    separators,
    bigintSuffix,
  };
}
