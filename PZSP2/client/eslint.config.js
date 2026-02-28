import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
    globalIgnores(["dist", "build", "coverage", "node_modules", "*.config.js"]),
    {
        files: ["**/*.{ts,tsx}"],
        extends: [
            js.configs.recommended,
            ...tseslint.configs.recommended,
            react.configs.flat.recommended,
            react.configs.flat["jsx-runtime"],
            reactHooks.configs["recommended-latest"],
            reactRefresh.configs.vite,
        ],
        languageOptions: {
            ecmaVersion: 2020,
            parserOptions: { ecmaFeatures: { jsx: true } },
            globals: globals.browser,
        },
        settings: {
            react: { version: "detect" },
        },
        rules: {
            "react/jsx-no-target-blank": ["warn", { enforceDynamicLinks: "always" }],
            "react/react-in-jsx-scope": "off",
            "@typescript-eslint/no-explicit-any": "off",
        },
    },
    prettierRecommended,
]);
