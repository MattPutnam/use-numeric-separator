import { ESLintUtils } from "@typescript-eslint/utils";

export const createRule = ESLintUtils.RuleCreator(
  (name) =>
    `https://github.com/MattPutnam/use-numeric-separator/blob/main/README.md#${name}`,
);
