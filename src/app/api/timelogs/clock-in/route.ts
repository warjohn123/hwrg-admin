import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function POST(req: Request) {
  const cors = handleCors(req);
  try {
    const body = await req.json();
    const { clock_in_photo, user_id } = body;

    const now = new Date();

    if (!clock_in_photo || !user_id) {
      return NextResponse.json(
        { error: 'Missing fields' },
        { status: 400, headers: cors?.headers },
      );
    }

    const data = await prisma.timelogs.create({
      data: { clock_in_photo, clock_in: now, user_id, date: now },
    });

    return NextResponse.json(
      {
        message: 'Clocked in successfully',
        data: serialize(data),
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
