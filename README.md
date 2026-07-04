# HWRG Admin

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Database & Migrations (Prisma)

The database is **PostgreSQL on Supabase**. Application data access uses
**Prisma**; Supabase is still used for **Auth** and **Storage**.

> Database access in API routes must go through Prisma. An ESLint rule
> (`no-restricted-syntax` in `eslint.config.mjs`) blocks
> `getSupabase().from(...)` / `.rpc(...)` under `src/app/api/**`.
> `getSupabase()` (`src/lib/supabaseServer.ts`) is for Auth/Storage only.

### Connections

- Runtime queries use the **pooled** connection (`DATABASE_URL`, `:6543`,
  pgbouncer) via the pg adapter in `src/lib/prisma.ts`.
- The Prisma **CLI** (migrate, `db pull/push`, studio) uses the **direct**
  connection (`DIRECT_URL`, `:5432`) — configured as the datasource `url` in
  `prisma.config.ts`. Migrations must never run over the pooler.

### Authoring a migration

Run against a **dev/branch database** (never prod):

```bash
# 1. Edit prisma/schema.prisma
# 2. Create + apply the migration locally
npx prisma migrate dev --name <change_name>
# 3. Commit the generated prisma/migrations/<timestamp>_<change_name>/ folder
```

Keep migrations **backwards-compatible** with the currently-deployed app — the
migration workflow and the Vercel deploy run independently, so a breaking change
must be split into deploy-safe steps (expand → migrate → contract).

### Auto-deploy of migrations (GitHub Actions)

`.github/workflows/migrate.yml` runs `prisma migrate deploy` on merge to `main`
(when anything under `prisma/` or the config changes), applying any pending
migrations. It can also be triggered manually via **Run workflow**
(`workflow_dispatch`).

**Required GitHub repository secrets** (Settings → Secrets and variables →
Actions) — paste the connection strings **without surrounding quotes**:

| Secret | Value |
| --- | --- |
| `DIRECT_URL` | Direct `:5432` connection — used by `migrate deploy`. |
| `DATABASE_URL` | Pooled `:6543` connection — used by `postinstall` generate. |

> **One-time prod baseline required.** The initial schema was introspected from
> an existing database, so before the workflow's first `migrate deploy` against
> production, the baseline must be marked applied there (so deploy doesn't try to
> re-run it against existing tables):
>
> ```bash
> # with DIRECT_URL pointing at PROD
> npx prisma migrate resolve --applied 0_init
> ```
>
> Prisma does not manage RLS policies, the `get_sales_by_branch_previous_date`
> function, or the `auth` schema — see `prisma/migrations/0_init/README.md`.

For a manual approval gate before prod migrations, move the secrets into a
GitHub **Environment** (e.g. `production`) with required reviewers and add
`environment: production` to the `migrate` job.

### Auto-migrating the Supabase dev branch

Supabase Branching does **not** run Prisma migrations (it only runs
`./supabase/migrations`, which this repo doesn't use). So
`.github/workflows/migrate-dev.yml` applies pending Prisma migrations to the
**dev** branch database on push to the `dev` git branch. It fetches the branch's
connection string at runtime with the Supabase CLI
(`supabase branches get <branch> -o env`) — no hardcoded dev DB URL — then runs
`prisma migrate deploy`.

**Required GitHub repository secrets** for the dev workflow:

| Secret | Value |
| --- | --- |
| `SUPABASE_ACCESS_TOKEN` | A Supabase account access token (Dashboard → Account → Access Tokens). |
| `SUPABASE_PROJECT_ID` | The **parent** project ref the dev branch lives under. |

Notes:
- Only fires when something under `prisma/` (or the workflow/config) changes —
  code-only pushes to `dev` don't trigger it (nothing to migrate).
- Assumes the Supabase branch name matches the git branch name (`dev`).

## Daily 10:00 AM Missing Clock-In Notification

This project includes a scheduled API job that runs daily at **10:00 AM Asia/Manila** and emails admins a list of employees who have not clocked in yet.

- Endpoint: `/api/notifications/missing-clock-ins`
- Schedule: `0 2 * * *` (UTC) in `vercel.json`, which is `10:00 AM` in Manila (`UTC+8`)
- Auth: set `CRON_SECRET` and Vercel will call the endpoint with `Authorization: Bearer <CRON_SECRET>`

Required environment variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
CRON_SECRET=
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

Optional environment variables for the Admin AI Assistant:

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-4o-mini
```

