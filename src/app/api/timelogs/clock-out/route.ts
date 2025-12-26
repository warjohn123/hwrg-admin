import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function PUT(req: Request) {
  const cors = handleCors(req);

  try {
    const body = await req.json();
    const { user_id, clock_out_photo } = body;

    if (!user_id) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400, headers: cors?.headers },
      );
    }

    // Insert into 'timelogs' table
    const { data, error: dbError } = await getSupabase()
      .from('timelogs')
      .update({ clock_out: new Date(), clock_out_photo })
      .eq('user_id', user_id)
      .order('clock_in', { ascending: false })
      .limit(1);

    if (dbError) {
      return NextResponse.json(
        { error: dbError.message },
        { status: 500, headers: cors?.headers },
      );
    }

    return NextResponse.json(
      {
        message: 'Clock out successful',
        user: data?.[0],
      },
      { headers: cors?.headers },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500, headers: cors?.headers },
    );
  }
}
