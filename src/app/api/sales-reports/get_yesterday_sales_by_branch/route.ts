import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  try {
    // Calls the existing Postgres function (managed outside Prisma migrations).
    const sales = await prisma.$queryRaw`
      SELECT * FROM get_sales_by_branch_previous_date(${date}::date)
    `;

    return NextResponse.json(
      { sales: serialize(sales) },
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
