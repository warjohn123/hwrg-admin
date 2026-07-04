import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, branch_id } = body;

    if (!user_id || !branch_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    await prisma.branch_assignments.deleteMany({
      where: {
        user_id,
        branch_id: Number(branch_id),
      },
    });

    return NextResponse.json({
      message: 'Branch assignment deleted successfully',
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
