import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const branchId = searchParams.get('branchId');
  const dates = searchParams.get('dates');

  let query = getSupabase()
    .from('sales_reports')
    .select(
      'id, title, report_date, cash, created_at, inventory, expenses(*)',
      {
        count: 'exact',
        head: false,
      },
    )
    .order('created_at', { ascending: false });

  // Optional branchId filtering
  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  if (dates) {
    const [start, end] = dates
      .split(',')
      .map((date) => new Date(date).toISOString().split('T')[0]);

    console.log({ start, end });

    query = query.gte('report_date', start).lte('report_date', end);
  }

  // Optional pagination
  if (pageParam && limitParam) {
    const page = parseInt(pageParam);
    const pageSize = parseInt(limitParam);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  console.log('error', error);

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
