import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = parseInt(searchParams.get('branch_id') || '1');

  const { data: assigned, error: err1 } = await getSupabase()
    .from('branch_assignments')
    .select('user_id')
    .eq('branch_id', branchId);

  if (err1) throw err1;

  const assignedUserIds = assigned?.map((row) => row.user_id) || [];

  // Step 2: fetch users not yet assigned
  const { data: users, error: err2 } = await getSupabase()
    .from('users')
    .select('id, name') // include other fields like email, role, etc.
    .not('id', 'in', assignedUserIds);

  if (err2) throw err2;

  return NextResponse.json({ users });
}
