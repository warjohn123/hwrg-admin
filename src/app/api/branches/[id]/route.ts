import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await req.json();

  const { error } = await getSupabase()
    .from('branches')
    .update(body)
    .eq('id', id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'User updated successfully' });
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data, error } = await getSupabase()
    .from('branches')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  const { error } = await getSupabase().from('branches').delete().eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { message: 'Branch deleted successfully' },
    { status: 200, headers: cors?.headers },
  );
}
