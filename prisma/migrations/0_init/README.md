# 0_init — baseline migration

This migration was generated from the introspected `schema.prisma` via
`prisma migrate diff --from-empty --to-schema` and recorded as **already
applied** against the live database with:

```bash
prisma migrate resolve --applied 0_init
```

It is a **baseline** for a database that already existed (introspected with
`prisma db pull` from the Supabase Postgres). The SQL here is **never executed
against production** — it only establishes the starting point of Prisma's
migration history so future `prisma migrate deploy` runs are meaningful.

## Not represented here (managed outside Prisma)

Prisma does not model these existing database objects, so they are intentionally
absent from `migration.sql`. They live in the database and must not be dropped:

- **Row Level Security (RLS)** policies on every table.
- The Postgres function **`get_sales_by_branch_previous_date`** (called via
  `prisma.$queryRaw` from the sales-reports route).
- The Supabase **`auth`** schema and any objects/foreign keys relating to it.
- `gen_random_uuid()` default expressions (present in SQL, but the extension
  providing them is managed by Supabase).

Any future migration that needs to change RLS, functions, or triggers must
include hand-written SQL in that migration's `migration.sql`.
