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
    const { title } = body; //TODO add sales, add_ons, expenses

    // Insert into 'sales_reports' table
    const { data, error: dbError } = await getSupabase()
      .from('remit_reports')
      .insert([
        {
          title,
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

    // const reportId = data?.[0].id;

    // for (const exp of expenses) {
    //   await getSupabase()
    //     .from('expenses')
    //     .insert([
    //       {
    //         sales_report_id: reportId,
    //         name: exp.name,
    //         value: exp.value,
    //       },
    //     ]);

    //   if (
    //     !(
    //       exp.name === 'Grab' ||
    //       exp.name === 'FoodPanda' ||
    //       exp.name === 'GCash'
    //     ) &&
    //     exp.value > 0
    //   ) {
    //     // Insert into 'company_expenses' table
    //     await getSupabase()
    //       .from('company_expenses')
    //       .insert([
    //         {
    //           name: exp.name,
    //           amount: exp.value,
    //           branch_id,
    //           type,
    //           expense_date: new Date().toISOString(),
    //           date: new Date().toISOString(),
    //         },
    //       ])
    //       .select('id'); //Ensure your table has a UUID 'id' column
    //   }
    // }

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
