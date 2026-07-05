import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { serialize } from '@/lib/serialize';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { branch_name, assignment } = body;

    if (!branch_name || !assignment) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const branch = await prisma.branches.create({
      data: { branch_name, assignment },
    });

    return NextResponse.json({
      message: 'Branch created successfully',
      branch: serialize(branch),
    });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
