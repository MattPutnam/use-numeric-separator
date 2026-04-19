import { createRule } from "../core/create-rule";
import { parseLiteral } from "../core/parseLiteral";
import { anyRunAtThreshold, canonicalize } from "../core/canonicalize";
import { DEFAULT_OPTIONS } from "../options/defaults";
import { normalize } from "../options/normalize";
import { optionsSchema } from "../options/schema";
import type { Base, RuleOptions } from "../core/types";

const ID_BY_BASE = {
  decimal: "missingNumericSeparatorDecimal",
  hex: "missingNumericSeparatorHex",
  binary: "missingNumericSeparatorBinary",
  octal: "missingNumericSeparatorOctal",
} as const;

const HUMAN_CASED: Record<Base, string> = {
  decimal: "Decimal",
  hex: "Hexadecimal",
  binary: "Binary",
  octal: "Octal",
};

type MessageIds = (typeof ID_BY_BASE)[Base];

const messageTemplate =
  "{{base}} literal '{{original}}' should use numeric separators: '{{suggested}}'.";

export const rule = createRule<RuleOptions, MessageIds>({
  name: "use-numeric-separator",
  meta: {
    type: "suggestion",
    docs: {
      description:
        "Require underscore numeric separators on long number literals (decimal, hex, binary, octal) per configurable per-base thresholds.",
    },
    fixable: "code",
    hasSuggestions: false,
    messages: {
      missingNumericSeparatorDecimal: messageTemplate,
      missingNumericSeparatorHex: messageTemplate,
      missingNumericSeparatorBinary: messageTemplate,
      missingNumericSeparatorOctal: messageTemplate,
    },
    schema: [optionsSchema],
  },
  defaultOptions: [{}],
  create(context) {
    const resolved = normalize(context.options[0], DEFAULT_OPTIONS);

    return {
      Literal(node) {
        const parsed = parseLiteral(node);
        if (!parsed) return;
        const opts = resolved[parsed.base];
        if (!opts.enabled) return;
        if (!anyRunAtThreshold(parsed, resolved)) return;
        const canonical = canonicalize(parsed, resolved);
        if (canonical === parsed.raw) return;
        context.report({
          node,
          messageId: ID_BY_BASE[parsed.base],
          data: {
            base: HUMAN_CASED[parsed.base],
            original: parsed.raw,
            suggested: canonical,
          },
          fix: (fixer) => fixer.replaceText(node, canonical),
        });
      },
    };
  },
});
