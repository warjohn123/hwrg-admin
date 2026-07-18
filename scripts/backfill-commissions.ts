/**
 * Backfill the `commissions` table from existing sales-report expenses.
 *
 * The submit hook (src/app/api/sales-reports/add/route.ts) only snapshots a
 * commission for reports created AFTER the add_commissions migration. This
 * script populates history for reports that already have a "Commission"
 * expense line item but no commission row.
 *
 * It is idempotent: a report that already has a commission row is skipped, so
 * re-running is safe.
 *
 * Usage (Node 24 — Node 18 breaks Prisma tooling here):
 *   nvm use 24
 *   npx tsx scripts/backfill-commissions.ts            # dry run (no writes)
 *   npx tsx scripts/backfill-commissions.ts --commit   # apply
 */
import 'dotenv/config';
import { prisma } from '../src/lib/prisma';
import { COMMISSION_EXPENSE_NAME } from '../src/constants/commission';

async function main() {
  const commit = process.argv.includes('--commit');

  // Commission expense line items on reports that don't yet have a commission.
  const commissionExpenses = await prisma.expenses.findMany({
    where: {
      name: { equals: COMMISSION_EXPENSE_NAME, mode: 'insensitive' },
      value: { gt: 0 },
      sales_report_id: { not: null },
      sales_reports: { commissions: { none: {} } },
    },
    select: {
      id: true,
      value: true,
      sales_report_id: true,
      sales_reports: { select: { report_date: true, title: true } },
    },
    orderBy: { sales_report_id: 'asc' },
  });

  // One commission per report, even if a report somehow has multiple
  // "Commission" expense rows — sum them, matching how a single report reads.
  const byReport = new Map<
    number,
    { amount: number; date: Date; title: string }
  >();

  for (const exp of commissionExpenses) {
    if (exp.sales_report_id == null || !exp.sales_reports) continue;
    const existing = byReport.get(exp.sales_report_id);
    const value = Number(exp.value);
    if (existing) {
      existing.amount += value;
    } else {
      byReport.set(exp.sales_report_id, {
        amount: value,
        date: exp.sales_reports.report_date,
        title: exp.sales_reports.title,
      });
    }
  }

  const rows = [...byReport.entries()].map(([sales_report_id, v]) => ({
    sales_report_id,
    amount: v.amount,
    date: v.date,
    title: v.title,
  }));

  console.log(
    `Found ${commissionExpenses.length} un-backfilled "${COMMISSION_EXPENSE_NAME}" expense(s) across ${rows.length} report(s).`,
  );
  for (const r of rows) {
    console.log(
      `  report ${r.sales_report_id} (${r.title}) — amount ${r.amount}, date ${r.date.toISOString().split('T')[0]}`,
    );
  }

  if (!commit) {
    console.log('\nDry run — no rows written. Re-run with --commit to apply.');
    return;
  }

  if (rows.length === 0) {
    console.log('\nNothing to backfill.');
    return;
  }

  const result = await prisma.commissions.createMany({
    data: rows.map(({ sales_report_id, amount, date }) => ({
      sales_report_id,
      amount,
      date,
    })),
  });

  console.log(`\nInserted ${result.count} commission row(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
