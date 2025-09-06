import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  const { data, error, count } = await getSupabase()
    .from('branch_assignments')
    .select('id, branch_id, users (id, name)')
    .eq('branch_id', id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 404, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { branch_assignments: data, total: count ?? 0 },
    {
      status: 200,
      headers: cors?.headers,
    },
  );
}
