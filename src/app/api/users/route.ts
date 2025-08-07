import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const search = searchParams.get('search');

  let query = getSupabase()
    .from('users')
    .select('id, name, email, assignment', { count: 'exact', head: false })
    .order('created_at', { ascending: false })
    .eq('type', 'employee');

  if (search) {
    query = query.like('name', `%${search}%`);
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ users: data, total: count ?? 0 });
}
