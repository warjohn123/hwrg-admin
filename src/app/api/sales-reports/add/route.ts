import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseServer';
import { handleCors } from '@/lib/cors';

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

    // Insert into 'sales_reports' table
    const { data, error: dbError } = await getSupabase()
      .from('sales_reports')
      .insert([
        {
          sales,
          cash,
          cash_fund,
          inventory,
          on_duty,
          prepared_by,
          type,
          user_id,
          branch_id,
          title,
          report_date: new Date().toISOString(),
        },
      ])
      .select('id'); //Ensure your table has a UUID 'id' column

    console.log('dbError', dbError);

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500, headers: cors?.headers },
      );
    }

    const reportId = data?.[0].id;

    for (const exp of expenses) {
      await getSupabase()
        .from('expenses')
        .insert([
          {
            sales_report_id: reportId,
            name: exp.name,
            value: exp.value,
          },
        ]);
    }

    return NextResponse.json(
      {
        message: 'Sales report created successfully',
        report: data?.[0],
      },
      {
        status: 200,
        headers: cors?.headers,
      },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: cors?.headers },
    );
  }
}
