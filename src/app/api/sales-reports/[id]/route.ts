import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
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

  const report = await prisma.sales_reports.findUnique({
    where: { id: Number(id) },
    include: { expenses: true },
  });

  if (!report) {
    return NextResponse.json(
      { error: 'Sales report not found' },
      { status: 404, headers: cors?.headers },
    );
  }

  return NextResponse.json(serialize(report), {
    headers: cors?.headers,
    status: 200,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  try {
    await prisma.sales_reports.deleteMany({ where: { id: Number(id) } });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Delete failed';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { message: 'Sales report deleted successfully' },
    { status: 200, headers: cors?.headers },
  );
}
