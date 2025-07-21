import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('limit') || '10');

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await getSupabase()
    .from('sales_reports')
    .select('id, title, report_date, created_at', {
      count: 'exact',
      head: false,
    })
    .range(from, to);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { sales_reports: data, total: count ?? 0 },
    { headers: cors?.headers, status: 200 },
  );
}
