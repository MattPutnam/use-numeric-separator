const perBase = {
  type: "object",
  additionalProperties: false,
  properties: {
    enabled: {
      type: "boolean",
      description:
        "When false, literals of this base are never reported regardless of digit count.",
    },
    threshold: {
      type: "integer",
      minimum: 3,
      description:
        "Digit count (integer part for decimal) at or above which separators are required.",
    },
    groupSize: {
      type: "integer",
      minimum: 2,
      description:
        "Number of digits between separators, counted from the right.",
    },
  },
} as const;

export const optionsSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    decimal: perBase,
    hex: perBase,
    binary: perBase,
    octal: perBase,
  },
} as const;
