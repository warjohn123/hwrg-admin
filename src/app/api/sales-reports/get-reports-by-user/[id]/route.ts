import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);
  const { id } = await params;

  try {
    const assignments = await prisma.branch_assignments.findMany({
      where: { user_id: id },
      select: { branch_id: true },
    });

    const branchIds = assignments.map((a) => a.branch_id);

    const pageParam = searchParams.get('page');
    const limitParam = searchParams.get('limit');
    const dates = searchParams.get('dates');

    const where: Prisma.sales_reportsWhereInput = {
      branch_id: { in: branchIds },
    };
    if (dates) {
      const [start, end] = dates
        .split(',')
        .map((date) => new Date(date).toISOString().split('T')[0]);
      where.report_date = { gte: new Date(start), lte: new Date(end) };
    }

    const args: Prisma.sales_reportsFindManyArgs = {
      where,
      select: {
        id: true,
        title: true,
        report_date: true,
        cash: true,
        created_at: true,
      },
      orderBy: { created_at: 'desc' },
    };

    if (pageParam && limitParam) {
      const page = parseInt(pageParam);
      const pageSize = parseInt(limitParam);
      args.skip = (page - 1) * pageSize;
      args.take = pageSize;
    }

    const [data, total] = await Promise.all([
      prisma.sales_reports.findMany(args),
      prisma.sales_reports.count({ where }),
    ]);

    return NextResponse.json(
      { sales_reports: serialize(data), total },
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
