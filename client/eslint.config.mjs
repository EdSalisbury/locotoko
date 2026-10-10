// ESLint flat config for the Vue 3 client. eslint-plugin-vue's recommended
// Vue 3 rules also flag leftover Vue 2 patterns (.native, slot="", $listeners,
// undeclared emits), which is what makes them useful after the migration.
import globals from "globals";
import pluginVue from "eslint-plugin-vue";
import eslintConfigPrettier from "eslint-config-prettier";

export default [
  { ignores: ["dist/**", "node_modules/**"] },
  ...pluginVue.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: { ...globals.browser },
    },
    rules: {
      // Component names like "TextInput" are already multi-word; page
      // components such as "HomePage" are fine as single files.
      "vue/multi-word-component-names": "off",
    },
  },
  eslintConfigPrettier,
];
