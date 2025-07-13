import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('limit') || '10');

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await getSupabase()
    .from('branches')
    .select('*', { count: 'exact', head: false })
    .order('created_at', { ascending: false }) // descending order
    .range(from, to);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ branches: data, total: count ?? 0 });
}
