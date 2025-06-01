// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
    rules: {
      "no-constant-condition": ["error", { "checkLoops": "allExceptWhileTrue" }],
      "@typescript-eslint/typedef": ["warn",
        { /** C++ is still better. */
          arrayDestructuring: true,
          arrowParameter: true,
          memberVariableDeclaration: true,
          objectDestructuring: true,
          parameter: true,
          propertyDeclaration: true,
          variableDeclaration: true,
          variableDeclarationIgnoreFunction: true,
        }],
      "@typescript-eslint/no-require-imports": "off",
    },
  },
);
