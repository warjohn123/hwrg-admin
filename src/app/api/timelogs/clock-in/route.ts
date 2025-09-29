import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const cors = handleCors(req);
    const { clock_in_photo, user_id } = body;

    const now = new Date();

    if (!clock_in_photo || !user_id) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400, headers: cors?.headers },
      );
    }

    // Insert into 'users' table
    const { data, error: dbError } = await getSupabase()
      .from('timelogs')
      .insert([{ clock_in_photo, clock_in: now, user_id, date: now }]);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json(
      {
        message: 'Clocked in successfully',
        data: data,
      },
      { headers: cors?.headers },
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
