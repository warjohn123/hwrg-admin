import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cors = handleCors(req);

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const assignment = searchParams.get('assignment');

  const where: Prisma.branchesWhereInput = {};
  if (assignment) where.assignment = assignment;

  const args: Prisma.branchesFindManyArgs = {
    where,
    orderBy: { created_at: 'desc' },
  };

  // Apply pagination only if both page and limit are provided
  if (pageParam && limitParam) {
    const page = parseInt(pageParam);
    const limit = parseInt(limitParam);
    args.skip = (page - 1) * limit;
    args.take = limit;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.branches.findMany(args),
      prisma.branches.count({ where }),
    ]);

    return NextResponse.json(
      { branches: serialize(data), total },
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
