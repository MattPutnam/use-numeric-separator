import { groupDigits } from "./groupDigits";
import type { ParsedLiteral, ResolvedOptions } from "./types";

export function canonicalize(
  parsed: ParsedLiteral,
  resolved: ResolvedOptions,
): string {
  const opts = resolved[parsed.base];
  const grouped = parsed.digitRuns.map((run) =>
    run.length >= opts.threshold ? groupDigits(run, opts.groupSize) : run,
  );

  let result = parsed.prefix;
  result += grouped[0] ?? "";
  for (let i = 0; i < parsed.separators.length; i++) {
    result += parsed.separators[i];
    result += grouped[i + 1] ?? "";
  }
  result += parsed.bigintSuffix;
  return result;
}

export function anyRunAtThreshold(
  parsed: ParsedLiteral,
  resolved: ResolvedOptions,
): boolean {
  const opts = resolved[parsed.base];
  return parsed.digitRuns.some((run) => run.length >= opts.threshold);
}
