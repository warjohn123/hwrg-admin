import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { Prisma } from '@prisma/client';
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

  const user = await prisma.users.findUnique({ where: { id } });

  if (!user) {
    return NextResponse.json(
      { error: 'User not found' },
      { status: 404, headers: cors?.headers },
    );
  }

  return NextResponse.json(serialize(user), { headers: cors?.headers });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;
  const body = await req.json();

  const { is_active, ...rest } = body;
  const data = {
    ...rest,
    ...(is_active !== undefined
      ? {
          is_active:
            typeof is_active === 'string'
              ? is_active === 'true'
              : Boolean(is_active),
        }
      : {}),
  } as Prisma.usersUpdateManyMutationInput;

  try {
    await prisma.users.updateMany({ where: { id }, data });

    return NextResponse.json(
      { message: 'User updated successfully' },
      { headers: cors?.headers },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Update failed';
    return NextResponse.json(
      { error: message },
      { status: 400, headers: cors?.headers },
    );
  }
}
