import { NextRequest, NextResponse } from 'next/server';
import getUTCDateRangeForToday from '@/lib/getUTCDateRangeForToday';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { handleCors } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cors = handleCors(req);
  const user_id = searchParams.get('user_id');

  const { startUTC, endUTC } = getUTCDateRangeForToday('Asia/Manila');

  try {
    const data = await prisma.timelogs.findMany({
      where: {
        user_id,
        clock_in: { gte: startUTC, lte: endUTC },
      },
      take: 1,
    });

    return NextResponse.json(serialize(data), { headers: cors?.headers });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }
}
