---
date: 2026-07-04
author: wcaruana@sesimi.com
repo: warjohn123/hwrg-admin
status: draft
tags: [prisma, supabase, migrations, github-actions, database]
---

# Prisma DB Integration + Auto-Migrations (GitHub Actions) — Implementation Plan

## Source
- Request: Integrate Prisma so the admin API uses Prisma for database access (currently the API talks to Supabase via `@supabase/supabase-js`), and auto-run new migrations via GitHub Actions.
- Repo: `hwrg-admin` (Next.js 15 App Router, deployed on Vercel).
- No Linear ticket referenced.

## Overview
The API's **database access** moves from the Supabase JS client (`getSupabase().from(...)`) to **Prisma**. Supabase **Auth** (login/sessions/`ProtectedRoute`) and **Storage** (file uploads) stay on Supabase — they are not database concerns and are out of scope. A GitHub Actions workflow runs `prisma migrate deploy` on merge to `main`, applying any new migrations to the live Supabase Postgres.

Prisma is already partially wired, which de-risks this significantly:
- `@prisma/client` v7 + `@prisma/adapter-pg` installed; singleton at `src/lib/prisma.ts`.
- `prisma/schema.prisma` already introspected (`db pull`) from the live DB.
- Two routes (`src/app/api/leave-requests/*`) already use Prisma — the **reference pattern** for the rest.

## Current State
- **Data access is isolated to ~30 API route files** under `src/app/api/**`. The `src/services/*.service.ts` layer is only client-side `fetch()` wrappers — no DB coupling there, so they need no changes.
- Server DB client: `src/lib/supabaseServer.ts` → `getSupabase()` uses the **service role key** (bypasses RLS).
- Prisma runtime client (`src/lib/prisma.ts`) connects via `pg` Pool to the Supabase **pooler** (`:6543`, pgbouncer), stripping `sslmode`/`pgbouncer` params.
- Supabase operation patterns in API routes: `.from().select()` (reads, incl. `.range()` pagination + `count`), `.insert()` (13), `.delete()` (7), `.update()` (5), `.single()` (6), and **one `.rpc('get_sales_by_branch_previous_date')`** in `src/app/api/sales-reports/get_yesterday_sales_by_branch/route.ts`.
- **No `prisma/migrations/` folder** — the schema was pulled from an already-existing prod DB.
- Every table carries **RLS**; the schema also depends on DB-side objects Prisma does not model: RLS policies, the `get_sales_by_branch_previous_date` function, `gen_random_uuid()` defaults, and the Supabase `auth` schema (FKs on `users.id`).
- `schema.prisma` `datasource db` block has **no `url`/`directUrl`** — the URL is injected via `prisma.config.ts` (`datasource.url = env('DATABASE_URL')`). `DIRECT_URL` (`:5432`, no pooler) exists in `.env` but is not yet used by the datasource.
- Deploy: Vercel `build` = `prisma generate && next build`. **Nothing runs `prisma migrate deploy` today** — schema changes are not being applied through migrations at all.

## Desired State
- Every API route's DB access uses Prisma; `getSupabase()` (server DB client) is removed.
- Supabase Auth + Storage untouched and still working.
- An initial baseline migration recorded and marked applied, so the migration history matches the live DB without attempting to recreate/drop existing RLS/functions.
- A GitHub Actions workflow applies pending migrations with `prisma migrate deploy` on merge to `main`, using the **direct** connection (`:5432`).

## Constraints and Decisions
- **Scope = DB queries only** (confirmed). Supabase Auth + Storage stay. Do **not** touch `src/lib/supabaseClient.ts`, `src/lib/supabase/server.ts`, `src/lib/uploadFile.ts`, `LoginForm`, `ProtectedRoute`, `Sidebar`, or `src/app/api/login/route.ts`'s `auth.signInWithPassword` call. (The login route's *`users` table read* — `.from('users').select('type')` — is in scope and moves to Prisma; the auth call is not.)
- **Migration trigger = on merge to `main`** (confirmed) via `prisma migrate deploy`.
- **Migrations must use `DIRECT_URL` (`:5432`)**, never the pgbouncer pooler (`:6543`) — pooled connections break DDL/advisory locks.
- **Prisma does not manage RLS, DB functions, triggers, or the `auth` schema.** The baseline migration is recorded-as-applied and never actually executed against prod, so these existing objects are preserved. Any future migration that must touch RLS/functions requires hand-written SQL in the migration file.
- **RLS parity:** the service role key bypasses RLS today; Prisma connecting as the `postgres` role also bypasses RLS. Behavior is preserved. This app has no per-user RLS enforcement at the DB layer to lose.
- **Type/serialization gotchas vs Supabase** (must be verified per route):
  - `remit_reports`/`remit_add_ons`/`remit_expenses` use **`BigInt`** ids → `JSON.stringify` throws on BigInt. Needs a serializer (BigInt→string) or `select`ing safe fields.
  - **`Decimal`** columns return Prisma `Decimal` objects, not JS numbers/strings — consumers may expect numbers.
  - **Date/timestamp** columns return JS `Date` objects; Supabase returned ISO strings. Response JSON shape can shift.
- **`.rpc()` call:** `get_sales_by_branch_previous_date` stays as a DB function; call it via `prisma.$queryRaw`. The function must remain in the DB (not dropped by any migration).
- **`prisma.config.ts` vs `schema.prisma` precedence (Prisma 7):** must confirm which wins for the datasource URL and how `directUrl` is honored by the CLI before relying on it (see Phase 1).

## Phases

### Phase 1: Solidify Prisma foundation + baseline the existing database — ✅ mostly done (2026-07-04)
**Goal:** Prisma migrate commands work against the DB without proposing destructive changes, and a recorded baseline exists so `migrate deploy` is meaningful.

> **Prisma 7 correction (discovered during implementation):** `url`/`directUrl`/`shadowDatabaseUrl` in the `schema.prisma` `datasource` block are **deprecated in v7** — connection URLs now live in `prisma.config.ts`, and the `url` there is what the **CLI uses for migrations**. So the schema block stays `provider`-only; the fix is in the config file. Also, `migrate diff --to-schema-datamodel` was renamed to **`--to-schema`** in v7.

**Changes:**
- [x] Point the **CLI/migration** connection at the direct `:5432` URL in `prisma.config.ts` (was `DATABASE_URL`, the pgbouncer pooler `:6543`):
      ```ts
      datasource: { url: env('DIRECT_URL') }   // env() helper from 'prisma/config'
      ```
      Runtime is unaffected — `src/lib/prisma.ts` builds its own pooled connection from `DATABASE_URL` via the pg adapter. `schema.prisma` datasource block left as `provider = "postgresql"` only.
- [x] Create the baseline migration from the current schema (offline; does not touch the DB):
      ```bash
      mkdir -p prisma/migrations/0_init
      npx prisma migrate diff --from-empty --to-schema prisma/schema.prisma \
        --script > prisma/migrations/0_init/migration.sql
      ```
      → 223 lines: 11 tables, 3 enums, unique indexes, FKs. No RLS/functions/auth (expected).
- [x] Add `prisma/migrations/0_init/README.md` documenting that RLS policies, `get_sales_by_branch_previous_date`, `gen_random_uuid()`, and the `auth` schema are **not** represented here and are managed outside Prisma.
- [x] **Mark the baseline applied — run against the DEV branch** (user confirmed `.env` points at a Supabase dev branch):
      ```bash
      npx prisma migrate resolve --applied 0_init   # → "Migration 0_init marked as applied."
      ```
- [x] Confirm `npx prisma migrate status` → "Database schema is up to date!" (1 migration).

**Success Criteria:**
- [x] `npx prisma validate` passes.
- [x] `npx prisma generate` succeeds.
- [x] `npx prisma migrate status` → up to date, 0 pending.
- [x] `npm run build` succeeds (Prisma generate + Next build; all routes compiled).

**Risks / Notes:**
- **Do not run `prisma migrate dev` against prod** — it can attempt schema resets. Use `diff` + `resolve --applied` only.
- Baselining now targets the **dev** DB (user created one). Prod will be baselined separately before the Phase 2 GitHub Actions workflow is allowed to run `migrate deploy` against it.
- The `--from-migrations` drift check needs a shadow database, so it's deferred to when a dev/shadow DB connection is wired (Phase 2), rather than run here.
- Rollback: this phase only adds files + (later) a row in `_prisma_migrations`. To undo the resolve: `prisma migrate resolve --rolled-back 0_init`.

### Phase 2: GitHub Actions auto-migration pipeline — ✅ done (2026-07-05)
**Goal:** Merges to `main` apply pending migrations to prod automatically and safely.

> **Correction (implementation):** `prisma migrate status` exits **1** whenever there are unapplied migrations — i.e. exactly when the workflow has work to do. So the preflight status step is **informational** (`continue-on-error: true`), not a gate. `migrate deploy` itself fails loudly on divergent/failed history, which covers the real safety need. Our CLI reads the datasource from `prisma.config.ts` (`env('DIRECT_URL')`), so the workflow provides **`DIRECT_URL`** at job level (plus `DATABASE_URL` for `postinstall` generate).

**Changes:**
- [x] Added `.github/workflows/migrate.yml`:
  - Trigger: `on: push: branches: [main]` with `paths` filter on `prisma/**` + config + the workflow file; plus `workflow_dispatch`.
  - Steps: checkout → setup Node 20 (`cache: npm`) → `npm ci` → informational `migrate status` → `prisma migrate deploy`.
  - Job-level `env`: `DIRECT_URL`, `DATABASE_URL` from secrets.
  - `concurrency: { group: prisma-migrate, cancel-in-progress: false }` — queue, never cancel a mid-flight migration.
- [ ] **User action:** add `DIRECT_URL` and `DATABASE_URL` as **GitHub repository secrets** (no surrounding quotes). `DIRECT_URL` = direct `:5432`.
- [x] Documented the migration flow + required secrets + prod-baseline caveat in `README.md`.

**Success Criteria:**
- [x] `prisma migrate deploy` is a green no-op with no pending migrations — verified locally against the dev branch ("No pending migrations to apply"). Same command the CI job runs.
- [ ] Full end-to-end CI run (needs the GitHub secrets set + a push to `main`): a trivial test migration applies through the workflow and `migrate status` shows it applied. Test on the dev branch first.
- [ ] Secrets not printed in logs (Prisma masks URLs; verify on first real run).

**Risks / Notes:**
- **This runs DDL against the live DB once pointed at prod.** Keep migrations additive/backwards-compatible; a `workflow_dispatch` + GitHub Environment approval gate can be added later (documented in README).
- **Prod not yet baselined.** Before the first prod `migrate deploy`, run `prisma migrate resolve --applied 0_init` with `DIRECT_URL` → prod, else deploy will try to run the baseline against existing tables and fail.
- Ordering vs Vercel: Actions and Vercel deploy independently on push. Fine for backwards-compatible migrations; sequence breaking ones per-change.
- Rollback: Prisma has no auto-down. Roll forward with a corrective migration.

### Phase 3: Migrate API route DB access to Prisma (incremental, by resource)
**Goal:** Replace every `getSupabase().from(...)`/`.rpc(...)` data call with Prisma, one resource group per PR, matching the `leave-requests` reference pattern.

### Phase 3 status — ✅ code complete (2026-07-05), manual runtime verification pending

**Shared helpers added:**
- `src/lib/serialize.ts` — deep-converts Prisma `BigInt`→number and `Decimal`→number for JSON responses (`Date` left as-is → ISO). Applied to all returned data.
- `src/lib/expenseType.ts` — `toExpenseType()` maps the `expense_type` DB labels ("Chicky Oink") to Prisma identifiers ("Chicky_Oink"); used in sales-reports/add + company_expenses filter/add/PUT.

**Changes (group per resource):**
- [x] **branches** — list+add+`[id]` get/put/delete + assignments route/add/remove.
- [x] **users** — route/add/`[id]`/branch-assignments/fetch-unassigned + `login` users read (kept `auth.signInWithPassword`; kept `auth.admin.createUser` in users/add).
- [x] **sales-reports** — route/add/`[id]`/get-last-report/get-reports-by-user + **RPC** route → `prisma.$queryRaw` on `get_sales_by_branch_previous_date`.
- [x] **collection-reports** — route/add/`[id]`.
- [x] **remit-reports** — route/add/`[id]` (BigInt ids; **serialize before totalling** so Decimal→number, else `sumKeyValueArray`'s `typeof===number` guard drops them).
- [x] **company_expenses** — route/add/`[id]` (UUID pk, enum `type` mapping, dynamic sort field).
- [x] **timelogs** — route/clock-in/clock-out/current-clockin (clock-out = findFirst-then-update).
- [x] **notifications** — cron endpoint migrated (dropped dead `admins` query); `CRON_SECRET` auth untouched.
- [x] **assistant** — DB reads migrated, OpenAI/fallback logic untouched, wrapped in try/catch for 500 parity.

**Parity conventions applied:** `.range`+count → `skip`/`take`+`count()`; `.single()` → `findUnique`+404; update/delete-by-id → `updateMany`/`deleteMany` (no throw on missing row, matching Supabase); exception paths → 500; success/validation/404 codes + messages preserved.

**Success Criteria:**
- [x] `npm run build`, `npm run lint`, `tsc --noEmit` all pass (lint: only pre-existing `exhaustive-deps` warnings in UI, none in touched files).
- [x] No `.from(` / `.rpc(` remain in `src/app/api`; only `getSupabase().auth.*` remains (login, users/add).
- [ ] **Manual runtime verification pending** — run against the dev branch and confirm response shapes, especially: remit-reports (BigInt→number), Decimal money fields (now numbers), and `@db.Date` fields (Prisma returns full ISO timestamps where Supabase returned `"YYYY-MM-DD"` — the one known shape drift to watch in the UI).

**Gotchas hit (for future reference):**
- Prisma 7 `migrate diff` flag rename + config-file datasource (Phase 1).
- Extracting query args into a `Prisma.XFindManyArgs`-typed variable **erases select/include inference** → relations drop off the result type. Inline the query when you access selected relations by name (fixed in remit list).

**Risks / Notes:**
- Highest-risk routes: remit-reports (BigInt), Decimal money fields, the RPC route, and any `@db.Date` field consumers. Test against real data.
- Runtime still uses the pooler via `src/lib/prisma.ts` (unchanged).
- Rollback: revert; Supabase server client still present until Phase 4.

**Out of scope (follow-up):** client-side `.from('users')` reads in `src/components/EmployeeDocuments.tsx` and `src/app/admin/employees/[id]/page.tsx` remain on the Supabase browser client — Prisma can't run in the browser, so removing them needs new API routes. Not part of "api connects with Supabase".

### Phase 4: Guardrails against Supabase DB-access regression — ✅ done (2026-07-05)
**Goal:** Prevent regression back to Supabase for DB access; clean up.

> **Deviation:** the plan assumed `src/lib/supabaseServer.ts` could be **deleted**, but `getSupabase()` is still required for **Auth** (`login` → `signInWithPassword`, `users/add` → `auth.admin.createUser`). So it is **kept**, and the guardrail bans DB access (`.from`/`.rpc`) rather than the whole client.

**Changes:**
- [x] Added an ESLint `no-restricted-syntax` rule (`eslint.config.mjs`) scoped to `src/app/api/**` that bans `getSupabase().from(...)` / `.rpc(...)`. Verified it fires (probe file → 2 errors), and that real code still lints clean.
- [x] Kept `src/lib/supabaseServer.ts` (Auth/Storage) with a TSDoc note that it must not be used for DB access; kept `supabaseClient.ts`, `supabase/server.ts`, `uploadFile.ts`.
- [x] Updated `README.md` (guardrail note; DB = Prisma, Auth/Storage = Supabase).

**Success Criteria:**
- [x] `grep -rE "getSupabase\(\)\.(from|rpc)" src` → no matches.
- [x] `npm run lint` + `npm run build` pass. (App boot / Auth / Storage / cron behaviour is unchanged code-wise — runtime smoke test still recommended, same as Phase 3.)

**Notes:**
- Enforcement runs at pre-commit via lint-staged (`next lint --fix`) and `npm run lint`. There is no CI job running lint yet — if desired, add a lint step to CI (or a `grep` check) so the guardrail is enforced on PRs too, not just locally.
- The rule matches the inline `getSupabase().from/.rpc` pattern (the one that existed). A `const c = getSupabase(); c.from(...)` variable form wouldn't be caught by the selector, but that pattern isn't used.

## Open Questions
- **Response shape parity:** should migrated routes preserve the exact previous JSON (Decimal-as-string, Date-as-ISO, BigInt-as-number/string), or is it acceptable to update the client consumers? This decides whether a serializer layer is needed in Phase 3.
- **Dev/branch database for testing migrations:** is there a non-prod Supabase/Postgres to author and test `migrate dev` against, so Phase 2's test migration never touches prod? Recommended before enabling the workflow.
- **`prisma.config.ts` fate:** keep it (Prisma 7 config-file approach) and drive `directUrl` correctly, or move fully to the `schema.prisma` datasource block? Resolve in Phase 1.
