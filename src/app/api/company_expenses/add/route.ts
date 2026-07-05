import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { toExpenseType } from '@/lib/expenseType';
import { handleCors } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function POST(req: Request) {
  const cors = handleCors(req);
  try {
    const body = await req.json();
    const { name, amount, branch_id, type, expense_date, notes } = body;

    const expense = await prisma.company_expenses.create({
      data: {
        name,
        amount,
        branch_id: Number(branch_id),
        type: toExpenseType(type),
        date: new Date(),
        expense_date: expense_date ? new Date(expense_date) : new Date(),
        notes,
      },
      select: { id: true },
    });

    return NextResponse.json(
      {
        message: 'Company expense created successfully',
        expense: serialize(expense),
      },
      {
        status: 200,
        headers: cors?.headers,
      },
    );
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }
}
