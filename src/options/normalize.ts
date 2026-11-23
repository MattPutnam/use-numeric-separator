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
    // A disabled base is never consulted, so its (possibly default-inherited)
    // threshold/groupSize combination must not fail the whole config.
    if (merged.enabled && merged.threshold < merged.groupSize + 1) {
      throw new TypeError(
        `use-numeric-separator: invalid options for base "${base}": threshold (${String(merged.threshold)}) must be >= groupSize + 1 (${String(merged.groupSize + 1)}).`,
      );
    }
    resolved[base] = merged;
  }
  return resolved;
}
