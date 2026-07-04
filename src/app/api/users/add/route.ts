import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabaseServer';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, type, assignment } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Create Auth user (stays on Supabase Auth)
    const { data: authUser, error: authError } =
      await getSupabase().auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Set to false if you want email confirmation
      });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || 'Auth creation failed' },
        { status: 500 },
      );
    }

    const user = await prisma.users.create({
      data: {
        id: authUser.user.id,
        name,
        email,
        type,
        assignment,
        is_active: true,
      },
    });

    return NextResponse.json({
      message: 'User created successfully',
      user: serialize(user),
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
