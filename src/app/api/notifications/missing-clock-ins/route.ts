import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/sendEmail';
import { DateTime } from 'luxon';
import { NextRequest, NextResponse } from 'next/server';

function isAuthorizedCronRequest(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return process.env.NODE_ENV !== 'production';
  }

  return req.headers.get('authorization') === `Bearer ${cronSecret}`;
}

function getTodayUtcRangeForManila() {
  const nowManila = DateTime.now().setZone('Asia/Manila');
  return {
    startUtcISO: nowManila.startOf('day').toUTC().toISO(),
    endUtcISO: nowManila.endOf('day').toUTC().toISO(),
    dateLabel: nowManila.toFormat('yyyy-LL-dd'),
  };
}

export async function GET(req: NextRequest) {
  if (!isAuthorizedCronRequest(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { startUtcISO, endUtcISO, dateLabel } = getTodayUtcRangeForManila();

  if (!startUtcISO || !endUtcISO) {
    return NextResponse.json(
      { error: 'Failed to compute date range' },
      { status: 500 },
    );
  }

  let employees;
  let todayTimelogs;
  try {
    [employees, todayTimelogs] = await Promise.all([
      prisma.users.findMany({
        where: {
          type: { in: ['employee', 'inventory_checker'] },
          is_active: true,
        },
        select: {
          id: true,
          name: true,
          email: true,
          assignment: true,
          type: true,
          is_active: true,
        },
      }),
      prisma.timelogs.findMany({
        where: {
          clock_in: { gte: new Date(startUtcISO), lte: new Date(endUtcISO) },
        },
        select: { user_id: true },
      }),
    ]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch users';
    return NextResponse.json({ error: message }, { status: 500 });
  }

  const adminEmails = ['warrencaruana1@gmail.com', 'hescosar@gmail.com'];

  if (adminEmails.length === 0) {
    return NextResponse.json(
      { error: 'No admin emails found to notify' },
      { status: 400 },
    );
  }

  const clockedInUserIds = new Set(todayTimelogs.map((log) => log.user_id));
  const missingClockIns = employees.filter(
    (employee) => !clockedInUserIds.has(employee.id),
  );

  const subject = `10:00 AM Clock-In Alert (${dateLabel})`;
  const lines = missingClockIns.length
    ? missingClockIns.map(
        (employee, index) =>
          `${index + 1}. ${employee.name} (${employee.assignment ?? 'No assignment'})`,
      )
    : ['All employees have already clocked in.'];

  const text = [
    `Date: ${dateLabel}`,
    '',
    "Employees who haven't clocked in yet:",
    ...lines,
  ].join('\n');

  const htmlList = missingClockIns.length
    ? `<ol>${missingClockIns
        .map(
          (employee) =>
            `<li>${employee.name} (${employee.assignment ?? 'No assignment'})</li>`,
        )
        .join('')}</ol>`
    : '<p>All employees have already clocked in.</p>';

  const html = `
    <div>
      <p><strong>Date:</strong> ${dateLabel}</p>
      <p><strong>Employees who haven't clocked in yet:</strong></p>
      ${htmlList}
    </div>
  `;

  await sendEmail({
    to: adminEmails,
    subject,
    text,
    html,
  });

  return NextResponse.json({
    sent: true,
    totalEmployees: employees.length,
    missingCount: missingClockIns.length,
    missingEmployees: missingClockIns.map(({ id, name, assignment }) => ({
      id,
      name,
      assignment,
    })),
  });
}
