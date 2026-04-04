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
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 404, headers: cors?.headers },
    );
  }

  return NextResponse.json(data, { headers: cors?.headers });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;
  const body = await req.json();

  const payload = {
    ...body,
    ...(body.is_active !== undefined
      ? {
          is_active:
            typeof body.is_active === 'string'
              ? body.is_active === 'true'
              : Boolean(body.is_active),
        }
      : {}),
  };

  const { error } = await getSupabase()
    .from('users')
    .update(payload)
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 400, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { message: 'User updated successfully' },
    { headers: cors?.headers },
  );
}
