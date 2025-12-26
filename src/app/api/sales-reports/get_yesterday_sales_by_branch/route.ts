import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);
  const date = searchParams.get('date');

  const { data, error } = await getSupabase().rpc(
    'get_sales_by_branch_previous_date',
    {
      p_date: date,
    },
  );

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { sales: data },
    { headers: cors?.headers, status: 200 },
  );
}
