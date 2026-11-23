import { groupDigits } from "./groupDigits";
import type { ParsedLiteral, PerBaseOptions } from "./types";

export function canonicalize(
  parsed: ParsedLiteral,
  opts: PerBaseOptions,
): string {
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
  opts: PerBaseOptions,
): boolean {
  return parsed.digitRuns.some((run) => run.length >= opts.threshold);
}
