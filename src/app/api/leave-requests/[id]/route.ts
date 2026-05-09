import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: Request) {
  return handleCors(req)!;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const leaveId = parseInt(id);

  try {
    const leaveRequest = await prisma.leave_requests.findUnique({
      where: { id: leaveId },
      include: { users: { select: { id: true, name: true } } },
    });

    if (!leaveRequest) {
      return NextResponse.json(
        { error: 'Leave request not found' },
        { status: 404 },
      );
    }

    return NextResponse.json(leaveRequest);
  } catch (error) {
    console.log('error test', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const leaveId = parseInt(id);

  try {
    const body = await req.json();

    const leaveRequest = await prisma.leave_requests.update({
      where: { id: leaveId },
      data: {
        ...body,
        ...(body.date_from && { date_from: new Date(body.date_from) }),
        ...(body.date_to && { date_to: new Date(body.date_to) }),
        updated_at: new Date(),
      },
    });

    return NextResponse.json(leaveRequest);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const leaveId = parseInt(id);

  try {
    await prisma.leave_requests.delete({
      where: { id: leaveId },
    });

    return NextResponse.json({ message: 'Leave request deleted' });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
