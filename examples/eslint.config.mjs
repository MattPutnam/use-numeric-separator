import useNumericSeparator from "../dist/index.js";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.ts"],
    languageOptions: { parser: tsParser },
    plugins: { "use-numeric-separator": useNumericSeparator },
    rules: {
      "use-numeric-separator/use-numeric-separator": "error",
    },
  },
];
