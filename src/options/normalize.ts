import {
  BASES,
  type PerBaseOptions,
  type ResolvedOptions,
  type RuleOptionsObject,
} from "../core/types";

export function normalize(
  userOpts: RuleOptionsObject | undefined,
  defaults: ResolvedOptions,
): ResolvedOptions {
  const resolved = {} as ResolvedOptions;
  const user = userOpts ?? {};
  for (const base of BASES) {
    const userBase = user[base] ?? {};
    const defaultBase = defaults[base];
    const merged: PerBaseOptions = {
      enabled: userBase.enabled ?? defaultBase.enabled,
      threshold: userBase.threshold ?? defaultBase.threshold,
      groupSize: userBase.groupSize ?? defaultBase.groupSize,
    };
    if (merged.threshold < merged.groupSize + 1) {
      throw new TypeError(
        `use-numeric-separator: invalid options for base "${base}": threshold (${String(merged.threshold)}) must be >= groupSize + 1 (${String(merged.groupSize + 1)}).`,
      );
    }
    resolved[base] = merged;
  }
  return resolved;
}
