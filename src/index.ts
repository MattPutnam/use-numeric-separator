import { rule } from "./rules/use-numeric-separator";
import type { RuleOptionsObject } from "./core/types";

const plugin = {
  rules: {
    "use-numeric-separator": rule,
  },
};

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace plugin {
  export type UseNumericSeparatorOptions = RuleOptionsObject;
}

export = plugin;
