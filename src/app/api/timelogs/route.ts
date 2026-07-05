import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: Request) {
  return handleCors(req)!;
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);

  const { searchParams } = new URL(req.url);

  const userId = searchParams.get('user_id');
  const search = searchParams.get('search');
  const dates = searchParams.get('dates');

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);
  const from = (page - 1) * limit;

  const where: Prisma.timelogsWhereInput = {};
  if (userId) where.user_id = userId;
  if (search) {
    where.users = { name: { contains: search, mode: 'insensitive' } };
  }
  if (dates) {
    const [start, end] = dates.split(',').map((d) => d.trim());
    where.date = { gte: new Date(start), lte: new Date(end) };
  }

  const args: Prisma.timelogsFindManyArgs = {
    where,
    orderBy: { created_at: 'desc' },
    skip: from,
    take: limit,
  };

  // Match the previous select behaviour: the joined user is only returned when
  // not filtering by a specific user_id.
  if (!userId) {
    args.include = { users: { select: { id: true, name: true } } };
  }

  try {
    const [data, total] = await Promise.all([
      prisma.timelogs.findMany(args),
      prisma.timelogs.count({ where }),
    ]);

    return NextResponse.json(
      { timelogs: serialize(data), total },
      { headers: cors?.headers },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }
}
