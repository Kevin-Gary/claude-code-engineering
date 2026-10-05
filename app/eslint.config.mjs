// 📘 ESLint flat config. `next/core-web-vitals` catches React and Next.js mistakes; `next/typescript`
// adds the TypeScript rules. A PostToolUse hook could run this after every edit; this repo runs the
// faster typecheck there instead and leaves lint to `npm run check`.
// Any stack: ruff or flake8 for Python, golangci-lint for Go, Checkstyle or Spotless for Java.
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
  { ignores: [".next/**", "node_modules/**", "next-env.d.ts"] },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default config;
