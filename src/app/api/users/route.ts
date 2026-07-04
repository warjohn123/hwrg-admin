import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const search = searchParams.get('search');

  const where: Prisma.usersWhereInput = {
    type: { in: ['employee', 'inventory_checker'] },
  };
  if (search) {
    where.name = { contains: search };
  }

  const args: Prisma.usersFindManyArgs = {
    where,
    select: {
      id: true,
      name: true,
      email: true,
      assignment: true,
      is_active: true,
    },
    orderBy: { created_at: 'desc' },
  };

  if (pageParam && limitParam) {
    const page = parseInt(pageParam);
    const pageSize = parseInt(limitParam);
    args.skip = (page - 1) * pageSize;
    args.take = pageSize;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.users.findMany(args),
      prisma.users.count({ where }),
    ]);

    return NextResponse.json({ users: serialize(data), total });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
