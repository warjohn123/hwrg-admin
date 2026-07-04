import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { toExpenseType } from '@/lib/expenseType';
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
  const type = searchParams.get('type');
  const branchId = searchParams.get('branch_id');
  const search = searchParams.get('search');
  const sort_field = searchParams.get('sort_field');
  const sort_direction = searchParams.get('sort_direction');

  const where: Prisma.company_expensesWhereInput = {};
  if (dates) {
    const [start, end] = dates
      .split(',')
      .map((date) => new Date(date).toISOString().split('T')[0]);
    where.expense_date = { gte: new Date(start), lte: new Date(end) };
  }
  if (type) where.type = toExpenseType(type);
  if (search) where.name = { contains: search };
  if (branchId) where.branch_id = Number(branchId);

  const args: Prisma.company_expensesFindManyArgs = {
    where,
    select: {
      id: true,
      expense_date: true,
      name: true,
      amount: true,
      notes: true,
      branches: { select: { id: true, branch_name: true } },
    },
  };

  if (sort_field && (sort_direction === 'asc' || sort_direction === 'desc')) {
    args.orderBy = {
      [sort_field]: sort_direction,
    } as Prisma.company_expensesOrderByWithRelationInput;
  }

  if (pageParam && limitParam) {
    const page = parseInt(pageParam);
    const pageSize = parseInt(limitParam);
    args.skip = (page - 1) * pageSize;
    args.take = pageSize;
  }

  try {
    const [data, total] = await Promise.all([
      prisma.company_expenses.findMany(args),
      prisma.company_expenses.count({ where }),
    ]);

    return NextResponse.json(
      { company_expenses: serialize(data), total },
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
