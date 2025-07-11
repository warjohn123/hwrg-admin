import { supabase } from '@/lib/supabaseClient';
import { getSupabase } from '@/lib/supabaseServer';
import { IUserType } from '@/types/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { email, password } = await req.json();

  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('type')
    .eq('id', data.user.id)
    .single();

  if (userError || userData?.type !== IUserType.ADMIN) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  return NextResponse.json({
    message: 'Login successful',
    session: data.session,
    user: data.user,
  });
}
