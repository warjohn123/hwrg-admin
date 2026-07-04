import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const branchId = parseInt(searchParams.get('branch_id') || '1');

  try {
    const assigned = await prisma.branch_assignments.findMany({
      where: { branch_id: branchId },
      select: { user_id: true },
    });

    const assignedUserIds = assigned.map((row) => row.user_id);

    // Fetch users not yet assigned to this branch
    const users = await prisma.users.findMany({
      where: { id: { notIn: assignedUserIds } },
      select: { id: true, name: true },
    });

    return NextResponse.json({ users: serialize(users) });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
