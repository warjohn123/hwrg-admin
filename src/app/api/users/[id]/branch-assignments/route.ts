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

  const { data, error } = await getSupabase()
    .from('branch_assignments')
    .select(
      'id, branch_id, user_id, users (id, name), branches (id, branch_name, assignment)',
    )
    .eq('user_id', id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 404, headers: cors?.headers },
    );
  }

  return NextResponse.json(data, {
    status: 200,
    headers: cors?.headers,
  });
}
