import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
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
  const branchId = searchParams.get('branchId');
  const dates = searchParams.get('dates');
  const type = searchParams.get('type');

  const salesReportFilter: Prisma.sales_reportsWhereInput = {};
  if (branchId) salesReportFilter.branch_id = Number(branchId);
  if (type) salesReportFilter.type = type;

  const where: Prisma.commissionsWhereInput = {};
  if (Object.keys(salesReportFilter).length > 0) {
    where.sales_reports = salesReportFilter;
  }
  if (dates) {
    const [start, end] = dates
      .split(',')
      .map((date) => new Date(date).toISOString().split('T')[0]);
    where.date = { gte: new Date(start), lte: new Date(end) };
  }

  const args: Prisma.commissionsFindManyArgs = {
    where,
    select: {
      id: true,
      amount: true,
      date: true,
      created_at: true,
      sales_report_id: true,
      sales_reports: {
        select: {
          report_date: true,
          on_duty: true,
          title: true,
        },
      },
    },
    orderBy: { date: 'desc' },
  };

  if (pageParam && limitParam) {
    const page = parseInt(pageParam);
    const pageSize = parseInt(limitParam);
    args.skip = (page - 1) * pageSize;
    args.take = pageSize;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.commissions.findMany(args),
      prisma.commissions.count({ where }),
    ]);

    return NextResponse.json(
      { commissions: serialize(data), total },
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
