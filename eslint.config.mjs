import prettierPlugin from "eslint-plugin-prettier";
import typescriptEslintPlugin from "@typescript-eslint/eslint-plugin";
import typescriptEslintParser from "@typescript-eslint/parser";

export default [
  {
    ignores: ["node_modules", "dist"], // Abaikan folder ini
  },
  {
    files: ["src/**/*.ts"], // Targetkan file TypeScript
    languageOptions: {
      parser: typescriptEslintParser, // Gunakan parser TypeScript
    },
    plugins: {
      "@typescript-eslint": typescriptEslintPlugin,
      prettier: prettierPlugin,
    },
    rules: {
      semi: ["error", "always"], // Wajibkan semicolon
      "prettier/prettier": "error", // Aturan Prettier
    },
  },
];
