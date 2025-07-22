import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');

  const supabase = getSupabase();
  let query = supabase
    .from('branches')
    .select('*', { count: 'exact', head: false })
    .order('created_at', { ascending: false }); // descending order

  // Apply pagination only if both page and limit are provided
  if (pageParam && limitParam) {
    const page = parseInt(pageParam);
    const limit = parseInt(limitParam);
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);
  }

  const { data, error, count } = await query;

  // const page = parseInt(searchParams.get('page') || '1');
  // const pageSize = parseInt(searchParams.get('limit') || '10');

  // const from = (page - 1) * pageSize;
  // const to = from + pageSize - 1;

  // const { data, error, count } = await getSupabase()
  //   .from('branches')
  //   .select('*', { count: 'exact', head: false })
  //   .order('created_at', { ascending: false }) // descending order
  //   .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ branches: data, total: count ?? 0 });
}
