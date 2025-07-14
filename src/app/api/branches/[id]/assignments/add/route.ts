import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, branch_id } = body;

    if (!user_id || !branch_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Insert into 'branches' table
    const { data, error: dbError } = await getSupabase()
      .from('branch_assignments')
      .insert({
        user_id,
        branch_id: parseInt(branch_id),
      });

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Branch assignment created successfully',
      branch: data?.[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
