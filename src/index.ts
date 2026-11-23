import type { TSESLint } from "@typescript-eslint/utils";
import { rule } from "./rules/use-numeric-separator";
import type { RuleOptionsObject } from "./core/types";

// Resolved at runtime relative to the emitted file (src/ or dist/), both of
// which sit one level below package.json, so the version never drifts.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { name, version } = require("../package.json") as {
  name: string;
  version: string;
};

const plugin = {
  meta: { name, version },
  rules: {
    "use-numeric-separator": rule,
  },
  configs: {} as { recommended: TSESLint.FlatConfig.Config },
};

plugin.configs.recommended = {
  name: "use-numeric-separator/recommended",
  plugins: { "use-numeric-separator": plugin },
  rules: {
    "use-numeric-separator/use-numeric-separator": "error",
  },
};

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace plugin {
  export type UseNumericSeparatorOptions = RuleOptionsObject;
}

export = plugin;
