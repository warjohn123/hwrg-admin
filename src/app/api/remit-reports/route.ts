import { handleCors } from '@/lib/cors';
import { sumKeyValueArray } from '@/lib/sumKeyValueArray';
import { sumSalesRemits } from '@/lib/sumSalesRemits';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import type { RemitSalesType } from '@/types/RemitReport';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const dates = searchParams.get('dates');

  const where: Prisma.remit_reportsWhereInput = {};
  if (dates) {
    const [start, end] = dates
      .split(',')
      .map((date) => new Date(date).toISOString().split('T')[0]);
    where.report_date = { gte: new Date(start), lte: new Date(end) };
  }

  const paginated = Boolean(pageParam && limitParam);
  const pageSize = paginated ? parseInt(limitParam!) : undefined;
  const skip = paginated ? (parseInt(pageParam!) - 1) * pageSize! : undefined;

  try {
    const [raw, total] = await Promise.all([
      prisma.remit_reports.findMany({
        where,
        select: {
          id: true,
          title: true,
          report_date: true,
          sales: true,
          remit_expenses: true,
          remit_add_ons: true,
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: pageSize,
      }),
      prisma.remit_reports.count({ where }),
    ]);

    // Serialize first so Decimal values become numbers before totalling.
    const data = serialize(raw);

    const enriched = data.map((report) => {
      const salesTotal = sumSalesRemits(report.sales as RemitSalesType);
      const expensesTotal = sumKeyValueArray(
        (report.remit_expenses as unknown as [{ [value: string]: number }]) ||
          [],
      );
      const addOnsTotal = sumKeyValueArray(
        (report.remit_add_ons as unknown as [{ [value: string]: number }]) ||
          [],
      );

      return {
        ...report,
        totals: {
          sales: salesTotal,
          expenses: expensesTotal,
          add_ons: addOnsTotal,
          remit_total: salesTotal + addOnsTotal - expensesTotal,
        },
      };
    });

    return NextResponse.json(
      { remit_reports: enriched, total },
      { headers: cors?.headers, status: 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }
}
