import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { user_id, branch_id } = body;

    if (!user_id || !branch_id) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const assignment = await prisma.branch_assignments.create({
      data: {
        user_id,
        branch_id: parseInt(branch_id),
      },
    });

    return NextResponse.json({
      message: 'Branch assignment created successfully',
      branch: serialize(assignment),
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
