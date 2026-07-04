import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { handleCors } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function POST(req: Request) {
  const cors = handleCors(req);
  try {
    const body = await req.json();
    const { branch_sales, add_ons, expenses } = body;

    const report = await prisma.collection_reports.create({
      data: {
        branch_sales,
        add_ons,
        expenses,
        date: new Date(),
      },
      select: { id: true },
    });

    return NextResponse.json(
      {
        message: 'Collection report created successfully',
        report: serialize(report),
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
