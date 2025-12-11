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
    const { title, expenses, add_ons, sales } = body;

    console.log('Received remit report data:', body);

    // Insert into 'sales_reports' table
    const { data, error: dbError } = await getSupabase()
      .from('remit_reports')
      .insert([
        {
          title,
          sales,
          report_date: new Date().toISOString(),
        },
      ])
      .select('id'); //Ensure your table has a UUID 'id' column

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500, headers: cors?.headers },
      );
    }

    const remitId = data?.[0].id;

    for (const exp of expenses) {
      await getSupabase()
        .from('remit_expenses')
        .insert([
          {
            remit_id: remitId,
            name: exp.name,
            value: exp.value,
          },
        ]);

      // if (
      //   !(
      //     exp.name === 'Grab' ||
      //     exp.name === 'FoodPanda' ||
      //     exp.name === 'GCash'
      //   ) &&
      //   exp.value > 0
      // ) {
      //   // Insert into 'company_expenses' table
      //   await getSupabase()
      //     .from('company_expenses')
      //     .insert([
      //       {
      //         name: exp.name,
      //         amount: exp.value,
      //         branch_id,
      //         type,
      //         expense_date: new Date().toISOString(),
      //         date: new Date().toISOString(),
      //       },
      //     ])
      //     .select('id'); //Ensure your table has a UUID 'id' column
      // }
    }

    for (const addOn of add_ons) {
      await getSupabase()
        .from('remit_add_ons')
        .insert([
          {
            remit_id: remitId,
            name: addOn.name,
            value: addOn.value,
          },
        ]);
    }

    return NextResponse.json(
      {
        message: 'Remit report created successfully',
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
