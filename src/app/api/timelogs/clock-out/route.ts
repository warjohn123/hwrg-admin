import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
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

    // Update the user's most recent timelog (Supabase did this with
    // update().order().limit(1); Prisma has no direct equivalent).
    const latest = await prisma.timelogs.findFirst({
      where: { user_id },
      orderBy: { clock_in: 'desc' },
    });

    let user = null;
    if (latest) {
      user = await prisma.timelogs.update({
        where: { id: latest.id },
        data: { clock_out: new Date(), clock_out_photo },
      });
    }

    return NextResponse.json(
      {
        message: 'Clock out successful',
        user: serialize(user),
      },
      { headers: cors?.headers },
    );
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }
}
