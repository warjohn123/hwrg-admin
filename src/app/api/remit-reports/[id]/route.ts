import { handleCors } from '@/lib/cors';
import { sumKeyValueArray } from '@/lib/sumKeyValueArray';
import { sumSalesRemits } from '@/lib/sumSalesRemits';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import type { RemitSalesType } from '@/types/RemitReport';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  const raw = await prisma.remit_reports.findUnique({
    where: { id: BigInt(id) },
    include: { remit_expenses: true, remit_add_ons: true },
  });

  if (!raw) {
    return NextResponse.json(
      { error: 'Remit report not found' },
      { status: 404, headers: cors?.headers },
    );
  }

  const data = serialize(raw);

  const salesTotal = sumSalesRemits(data.sales as RemitSalesType);
  const expensesTotal = sumKeyValueArray(
    (data.remit_expenses as unknown as [{ [value: string]: number }]) || [],
  );
  const addOnsTotal = sumKeyValueArray(
    (data.remit_add_ons as unknown as [{ [value: string]: number }]) || [],
  );

  return NextResponse.json(
    {
      ...data,
      totals: {
        remit_total: salesTotal + addOnsTotal - expensesTotal,
        expenses: expensesTotal,
        add_ons: addOnsTotal,
      },
    },
    { headers: cors?.headers, status: 200 },
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  try {
    await prisma.remit_reports.deleteMany({ where: { id: BigInt(id) } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { message: 'Remit report deleted successfully' },
    { status: 200, headers: cors?.headers },
  );
}
