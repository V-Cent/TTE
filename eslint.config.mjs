import globals from "globals";
import eslintConfigPrettier from "eslint-config-prettier/flat";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      globals: globals.browser,
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...tseslint.configs.recommended.rules,
      "no-constant-condition": ["error", { "checkLoops": "allExceptWhileTrue" }]
    },
  },
  eslintConfigPrettier,
];
