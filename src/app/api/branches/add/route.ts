import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseServer';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { branch_name, assignment } = body;

    if (!branch_name || !assignment) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Insert into 'branches' table
    const { data, error: dbError } = await getSupabase()
      .from('branches')
      .insert([{ branch_name, assignment }]); // Ensure your table has a UUID 'id' column

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Branch created successfully',
      branch: data?.[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
