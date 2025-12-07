import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get('user_id');
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('limit') || '10');
  const dates = searchParams.get('dates');

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (user_id) {
    const { data, error, count } = await getSupabase()
      .from('timelogs')
      .select('*', { count: 'exact', head: false })
      .eq('user_id', user_id)
      .order('created_at', { ascending: false }) // descending order
      .range(from, to);

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
  } else {
    let query = getSupabase()
      .from('timelogs')
      .select('*, users (id, name)', { count: 'exact', head: false })
      .order('created_at', { ascending: false }); // descending order

    if (dates) {
      const [start, end] = dates
        .split(',')
        .map((date) => new Date(date).toISOString().split('T')[0]);

      query = query.gte('date', start).lte('date', end);
    }

    if (page && pageSize) {
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
      { timelogs: data, total: count ?? 0 },
      { headers: cors?.headers },
    );
  }
}
