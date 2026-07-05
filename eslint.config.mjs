import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    // Guardrail: API routes must use Prisma (`@/lib/prisma`) for database
    // access. The Supabase client is reserved for Auth/Storage only. This bans
    // reintroducing `getSupabase().from(...)` / `.rpc(...)` DB calls.
    files: ["src/app/api/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "CallExpression[callee.object.callee.name='getSupabase'][callee.property.name=/^(from|rpc)$/]",
          message:
            "Do not use the Supabase client for database access. Use Prisma (`@/lib/prisma`). Supabase is for Auth/Storage only.",
        },
      ],
    },
  },
];

export default eslintConfig;
