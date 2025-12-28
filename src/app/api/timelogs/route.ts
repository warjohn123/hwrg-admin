import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: Request) {
  return handleCors(req)!;
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);
  const supabase = getSupabase();

  const { searchParams } = new URL(req.url);

  const userId = searchParams.get('user_id');
  const search = searchParams.get('search');
  const dates = searchParams.get('dates');

  const page = Number(searchParams.get('page') ?? 1);
  const limit = Number(searchParams.get('limit') ?? 10);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const selectClause = userId
    ? '*'
    : search
      ? '*, users!inner (id, name)'
      : '*, users (id, name)';

  // ---- Base query ----
  let query = supabase
    .from('timelogs')
    .select(selectClause, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  // ---- Filters ----
  if (userId) {
    query = query.eq('user_id', userId);
  }

  if (search) {
    query = query.ilike('users.name', `%${search}%`);
  }

  if (dates) {
    const [start, end] = dates.split(',').map((d) => d.trim());

    query = query.gte('date', start).lte('date', end);
  }

  // ---- Execute ----
  const { data, error, count } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { timelogs: data, total: count ?? 0 },
    { headers: cors?.headers },
  );
}
