import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleCors } from '@/lib/cors';
import { toExpenseType } from '@/lib/expenseType';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function POST(req: Request) {
  const cors = handleCors(req);
  try {
    const body = await req.json();
    const {
      sales,
      inventory,
      expenses,
      on_duty,
      prepared_by,
      type,
      cash,
      cash_fund,
      branch_id,
      title,
      user_id,
    } = body;

    const report = await prisma.sales_reports.create({
      data: {
        sales,
        cash,
        cash_fund,
        inventory,
        on_duty,
        prepared_by,
        type,
        user_id,
        branch_id: Number(branch_id),
        title,
        report_date: new Date(),
      },
      select: { id: true },
    });

    for (const exp of expenses) {
      await prisma.expenses.create({
        data: {
          sales_report_id: report.id,
          name: exp.name,
          value: exp.value,
        },
      });

      if (
        !(
          exp.name === 'Grab' ||
          exp.name === 'FoodPanda' ||
          exp.name === 'GCash'
        ) &&
        exp.value > 0
      ) {
        await prisma.company_expenses.create({
          data: {
            name: exp.name,
            amount: exp.value,
            branch_id: Number(branch_id),
            type: toExpenseType(type),
            expense_date: new Date(),
            date: new Date(),
          },
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Sales report created successfully',
        report,
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
