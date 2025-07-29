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
    const { branch_sales, add_ons, expenses } = body;

    // Insert into 'collection_reports' table
    const { data, error: dbError } = await getSupabase()
      .from('collection_reports')
      .insert([
        {
          branch_sales,
          add_ons,
          expenses,
          date: new Date().toISOString(),
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
        message: 'Collection report created successfully',
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
