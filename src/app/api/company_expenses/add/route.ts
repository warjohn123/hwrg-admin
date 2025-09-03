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
    const { name, amount, branch_id, type, expense_date, notes } = body;

    // Insert into 'company_expenses' table
    const { data, error: dbError } = await getSupabase()
      .from('company_expenses')
      .insert([
        {
          name,
          amount,
          branch_id,
          type,
          date: new Date().toISOString(),
          expense_date: expense_date ? expense_date : new Date().toISOString(),
          notes
        },
      ])
      .select('id'); //Ensure your table has a UUID 'id' column

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500, headers: cors?.headers },
      );
    }

    return NextResponse.json(
      {
        message: 'Company expense created successfully',
        expense: data?.[0],
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
