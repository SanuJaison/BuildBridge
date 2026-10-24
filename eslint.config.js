import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    rules: {
      // Network effects legitimately set loading/result state; the compiler-backed
      // version of this rule flags every fetch-on-mount pattern in the app.
      "react-hooks/set-state-in-effect": "off",
      // Contexts intentionally co-locate their provider and consumer hook.
      "react-refresh/only-export-components": "off",
    },
  },
])
