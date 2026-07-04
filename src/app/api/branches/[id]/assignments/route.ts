import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  try {
    const data = await prisma.branch_assignments.findMany({
      where: { branch_id: Number(id) },
      select: {
        id: true,
        branch_id: true,
        users: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      { branch_assignments: serialize(data), total: data.length },
      { status: 200, headers: cors?.headers },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json(
      { error: message },
      { status: 500, headers: cors?.headers },
    );
  }
}
