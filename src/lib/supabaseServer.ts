import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client for **Auth and Storage admin operations only**
 * (e.g. `auth.signInWithPassword`, `auth.admin.createUser`).
 *
 * Do NOT use this for database access — use Prisma (`@/lib/prisma`) instead.
 * An ESLint rule blocks `getSupabase().from(...)` / `.rpc(...)` in API routes.
 */
export const getSupabase = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
};
