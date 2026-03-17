import globals from "globals"
import tseslint from "typescript-eslint"
import pluginVue from "eslint-plugin-vue"
import eslintConfigPrettier from "eslint-config-prettier"

export default [
  {
    name: "globals",
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  {
    name: "ignore",
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/*.min.*",
      "**/pnpm-lock.yaml",
    ],
  },
  ...tseslint.configs.recommended,
  {
    name: "vue",
    ...pluginVue.configs["flat/recommended"],
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
  },
  eslintConfigPrettier,
]
