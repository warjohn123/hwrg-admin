import { getSupabase } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
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

  const userData = await prisma.users.findUnique({
    where: { id: data.user.id },
    select: { type: true },
  });

  if (!userData || userData.type !== IUserType.ADMIN) {
    return NextResponse.json({ error: 'Access denied' }, { status: 403 });
  }

  return NextResponse.json({
    message: 'Login successful',
    session: data.session,
    user: data.user,
  });
}
