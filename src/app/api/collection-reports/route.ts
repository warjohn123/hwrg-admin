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
  const dates = searchParams.get('dates');

  const where: Prisma.collection_reportsWhereInput = {};
  if (dates) {
    const [start, end] = dates
      .split(',')
      .map((date) => new Date(date).toISOString().split('T')[0]);
    where.date = { gte: new Date(start), lte: new Date(end) };
  }

  const args: Prisma.collection_reportsFindManyArgs = {
    where,
    select: { id: true, date: true, branch_sales: true },
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
      prisma.collection_reports.findMany(args),
      prisma.collection_reports.count({ where }),
    ]);

    return NextResponse.json(
      { collection_reports: serialize(data), total },
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
