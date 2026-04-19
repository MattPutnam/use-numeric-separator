export type Base = "decimal" | "hex" | "binary" | "octal";

export const BASES: readonly Base[] = ["decimal", "hex", "binary", "octal"];

export interface PerBaseOptions {
  enabled: boolean;
  threshold: number;
  groupSize: number;
}

export interface RuleOptionsObject {
  decimal?: Partial<PerBaseOptions>;
  hex?: Partial<PerBaseOptions>;
  binary?: Partial<PerBaseOptions>;
  octal?: Partial<PerBaseOptions>;
}

export type RuleOptions = [RuleOptionsObject];

export type ResolvedOptions = Record<Base, PerBaseOptions>;

export interface ParsedLiteral {
  base: Base;
  prefix: string;
  raw: string;
  digitRuns: string[];
  separators: string[];
  bigintSuffix: "" | "n";
}
