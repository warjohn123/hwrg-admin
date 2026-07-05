import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { toExpenseType } from '@/lib/expenseType';
import { Prisma } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  const body = await req.json();
  const { type, branch_id, ...rest } = body;

  const data = {
    ...rest,
    ...(type !== undefined ? { type: toExpenseType(type) } : {}),
    ...(branch_id !== undefined ? { branch_id: Number(branch_id) } : {}),
  } as Prisma.company_expensesUpdateManyMutationInput;

  try {
    await prisma.company_expenses.updateMany({ where: { id }, data });

    return NextResponse.json(
      { message: 'Company expense updated successfully' },
      { status: 200, headers: cors?.headers },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  try {
    await prisma.company_expenses.deleteMany({ where: { id } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { message: 'Company expense deleted successfully' },
    { status: 200, headers: cors?.headers },
  );
}
