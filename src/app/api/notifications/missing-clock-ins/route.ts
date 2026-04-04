import { getSupabase } from '@/lib/supabaseServer';
import { sendEmail } from '@/lib/sendEmail';
import { DateTime } from 'luxon';
import { NextRequest, NextResponse } from 'next/server';

type Employee = {
  id: string;
  name: string;
  email: string | null;
  assignment: string | null;
  type: string;
  is_active: boolean;
};

// type Admin = {
//   id: string;
//   name: string;
//   email: string | null;
// };

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

  const supabase = getSupabase();
  const { startUtcISO, endUtcISO, dateLabel } = getTodayUtcRangeForManila();

  if (!startUtcISO || !endUtcISO) {
    return NextResponse.json(
      { error: 'Failed to compute date range' },
      { status: 500 },
    );
  }

  const [
    { data: employees, error: employeesError },
    { data: admins, error: adminsError },
  ] = await Promise.all([
    supabase
      .from('users')
      .select('id, name, email, assignment, type, is_active')
      .in('type', ['employee', 'inventory_checker'])
      .eq('is_active', true),
    supabase.from('users').select('id, name, email').eq('type', 'admin'),
  ]);

  console.log('admins', admins);

  if (employeesError || adminsError) {
    return NextResponse.json(
      {
        error:
          employeesError?.message ??
          adminsError?.message ??
          'Failed to fetch users',
      },
      { status: 500 },
    );
  }

  const { data: todayTimelogs, error: timelogError } = await supabase
    .from('timelogs')
    .select('user_id')
    .gte('clock_in', startUtcISO)
    .lte('clock_in', endUtcISO);

  if (timelogError) {
    return NextResponse.json({ error: timelogError.message }, { status: 500 });
  }

  const adminEmails = ['warrencaruana1@gmail.com', 'hescosar@gmail.com'];

  //   const adminEmails = (admins as Admin[])
  //     .map((admin) => admin.email)
  //     .filter((email): email is string => Boolean(email));

  if (adminEmails.length === 0) {
    return NextResponse.json(
      { error: 'No admin emails found to notify' },
      { status: 400 },
    );
  }

  const clockedInUserIds = new Set(
    (todayTimelogs ?? []).map((log) => log.user_id),
  );
  const missingClockIns = (employees as Employee[]).filter(
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
    totalEmployees: (employees as Employee[]).length,
    missingCount: missingClockIns.length,
    missingEmployees: missingClockIns.map(({ id, name, assignment }) => ({
      id,
      name,
      assignment,
    })),
  });
}
