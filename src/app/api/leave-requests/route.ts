import { handleCors } from '@/lib/cors';
import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(req: Request) {
  return handleCors(req)!;
}

export async function GET(req: NextRequest) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);

  const pageParam = searchParams.get('page');
  const limitParam = searchParams.get('limit');
  const userId = searchParams.get('user_id');
  const status = searchParams.get('status');
  const leaveType = searchParams.get('leave_type');
  const name = searchParams.get('name');
  const sortField = searchParams.get('sort_field') ?? 'created_at';
  const sortDirection = (searchParams.get('sort_direction') ?? 'desc') as
    | 'asc'
    | 'desc';

  const page = parseInt(pageParam ?? '1');
  const limit = parseInt(limitParam ?? '10');
  const skip = (page - 1) * limit;

  const allowedSortFields = [
    'created_at',
    'date_from',
    'date_to',
    'status',
    'leave_type',
  ];
  const safeField = allowedSortFields.includes(sortField)
    ? sortField
    : 'created_at';

  const where: Record<string, unknown> = {};
  if (userId) where.user_id = userId;
  if (status) where.status = status.toUpperCase();
  if (leaveType) where.leave_type = leaveType.toUpperCase();
  if (name) where.users = { name: { contains: name, mode: 'insensitive' } };

  try {
    const [data, total] = await Promise.all([
      prisma.leave_requests.findMany({
        where,
        include: { users: { select: { id: true, name: true } } },
        orderBy: { [safeField]: sortDirection },
        skip,
        take: limit,
      }),
      prisma.leave_requests.count({ where }),
    ]);

    return NextResponse.json(
      { leave_requests: data, total },
      { headers: cors?.headers },
    );
  } catch (error) {
    console.log('error test', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cors = handleCors(req);
    const body = await req.json();

    const { user_id, leave_type, start_date, end_date, reason } = body;

    if (!user_id || !leave_type || !start_date || !end_date || !reason) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400, headers: cors?.headers },
      );
    }

    const leaveRequest = await prisma.leave_requests.create({
      data: {
        user_id,
        leave_type: leave_type.toUpperCase(),
        date_from: new Date(start_date),
        date_to: new Date(end_date),
        reason,
      },
    });

    return NextResponse.json(leaveRequest, {
      status: 201,
      headers: cors?.headers,
    });
  } catch (error) {
    console.log('error test', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
