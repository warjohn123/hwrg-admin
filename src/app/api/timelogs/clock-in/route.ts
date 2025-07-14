import { getSupabase } from '@/lib/supabaseServer';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { clock_in_photo, user_id } = body;

    const now = new Date().toISOString();
    const formattedDate = now.split('T')[0];

    if (!clock_in_photo || !user_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Insert into 'users' table
    const { data, error: dbError } = await getSupabase()
      .from('timelogs')
      .insert([
        { clock_in_photo, clock_in: now, user_id, date: formattedDate },
      ]); // Ensure your table has a UUID 'id' column

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Clocked in successfully',
      data: data,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
