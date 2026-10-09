// ESLint flat config for the NestJS server (src/). Replaces .eslintrc.js:
// ESLint 9+ only reads flat config, and flat config doesn't cascade by
// directory, so the Vue client's own settings under client/ no longer leak in.
import globals from "globals";
import tseslint from "typescript-eslint";
import eslintPluginPrettierRecommended from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    ignores: ["dist/**", "node_modules/**", "client/**", "ebay/**", "scripts/**", "coverage/**"],
  },
  ...tseslint.configs.recommended,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Same overrides as the old .eslintrc.js. ("interface-name-prefix" was
      // removed from typescript-eslint and is no longer needed.)
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
);
