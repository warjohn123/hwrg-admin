import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseServer';
import { handleCors } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return (await handleCors(request))!;
}

export async function POST(req: Request) {
  const corsResponse = await handleCors(req);
  if (corsResponse) return corsResponse;

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
          expenses,
          on_duty,
          prepared_by,
          type,
          title: 'This is a report',
          report_date: new Date().toISOString(),
        },
      ]); // Ensure your table has a UUID 'id' column

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Sales report created successfully',
      report: data?.[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
