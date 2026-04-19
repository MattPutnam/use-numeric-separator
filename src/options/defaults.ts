import type { ResolvedOptions } from "../core/types";

export const DEFAULT_OPTIONS: ResolvedOptions = {
  decimal: { enabled: true, threshold: 6, groupSize: 3 },
  hex: { enabled: true, threshold: 6, groupSize: 4 },
  binary: { enabled: true, threshold: 6, groupSize: 4 },
  octal: { enabled: true, threshold: 6, groupSize: 3 },
};
