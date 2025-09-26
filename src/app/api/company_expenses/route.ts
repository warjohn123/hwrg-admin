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
  const dates = searchParams.get('dates');
  const type = searchParams.get('type');
  const branchId = searchParams.get('branch_id');
  const search = searchParams.get('search');
  const sort_field = searchParams.get('sort_field');
  const sort_direction = searchParams.get('sort_direction');

  let query = getSupabase()
    .from('company_expenses')
    .select(
      'id, expense_date, name, amount, notes, branches(id, branch_name)',
      {
        count: 'exact',
        head: false,
      },
    );

  if (dates) {
    const [start, end] = dates
      .split(',')
      .map((date) => new Date(date).toISOString().split('T')[0]);

    query = query.gte('expense_date', start).lte('expense_date', end);
  }

  if (type) {
    query = query.eq('type', type);
  }

  if (search) {
    query = query.like('name', `%${search}%`);
  }

  if (branchId) {
    query = query.eq('branch_id', branchId);
  }

  if (sort_field && (sort_direction === 'asc' || sort_direction === 'desc')) {
    query = query.order(sort_field, { ascending: sort_direction === 'asc' });
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

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { company_expenses: data, total: count ?? 0 },
    { headers: cors?.headers, status: 200 },
  );
}
