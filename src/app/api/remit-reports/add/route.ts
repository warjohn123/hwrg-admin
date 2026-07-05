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
    const { title, expenses, add_ons, sales } = body;

    const report = await prisma.remit_reports.create({
      data: {
        title,
        sales,
        report_date: new Date(),
      },
      select: { id: true },
    });

    for (const exp of expenses) {
      await prisma.remit_expenses.create({
        data: {
          remit_id: report.id,
          name: exp.name,
          value: exp.value,
        },
      });
    }

    for (const addOn of add_ons) {
      await prisma.remit_add_ons.create({
        data: {
          remit_id: report.id,
          name: addOn.name,
          value: addOn.value,
        },
      });
    }

    return NextResponse.json(
      {
        message: 'Remit report created successfully',
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
