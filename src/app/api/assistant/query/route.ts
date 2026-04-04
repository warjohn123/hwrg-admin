import { getSupabase } from '@/lib/supabaseServer';
import { getChickyOinkTotalSales } from '@/lib/getChickyOinkTotalSales';
import { getHWRGEggsTotalSales } from '@/lib/getHWRGEggsTotalSales';
import { getImagawayakiTotalSales } from '@/lib/getImagawayakiTotalSales';
import { getPotatoFryTotalSales } from '@/lib/getPotatoFryTotalSales';
import { ChickyOinkSales } from '@/types/ChickyOinkReport';
import { IHWRGEggsSales } from '@/types/HWRGEggsReport';
import { ImagawayakiSales } from '@/types/ImagawayakiReport';
import { PotatoFrySales } from '@/types/PotatoFryReport';
import { IAssignment } from '@/types/User';
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

type AssistantSnapshot = {
  date: string;
  timeZone: string;
  employees: {
    total: number;
    active: number;
    inactive: number;
  };
  branches: {
    total: number;
    names: string[];
  };
  timelogsToday: {
    clockedInActiveCount: number;
    missingClockInCount: number;
    missingClockInEmployees: Array<{
      id: string;
      name: string;
      assignment: string | null;
    }>;
  };
  salesSummary?: {
    periodLabel: string;
    startDate: string;
    endDate: string;
    reportCount: number;
    totalSales: number;
    byType: Array<{
      type: string;
      totalSales: number;
    }>;
  };
};

type SalesReportRow = {
  type: string;
  sales: unknown;
  cash: number | null;
  report_date: string;
};

function parseSalesPeriod(question: string, nowManila: DateTime) {
  const normalized = question.toLowerCase();

  const hasSalesIntent =
    normalized.includes('sales') ||
    normalized.includes('total sale') ||
    normalized.includes('revenue');

  if (!hasSalesIntent) {
    return null;
  }

  if (normalized.includes('yesterday')) {
    const day = nowManila.minus({ days: 1 });
    return {
      label: 'yesterday',
      start: day.startOf('day'),
      end: day.endOf('day'),
    };
  }

  if (normalized.includes('last week')) {
    const base = nowManila.minus({ weeks: 1 });
    return {
      label: 'last week',
      start: base.startOf('week'),
      end: base.endOf('week'),
    };
  }

  if (normalized.includes('this week')) {
    return {
      label: 'this week',
      start: nowManila.startOf('week'),
      end: nowManila.endOf('week'),
    };
  }

  if (normalized.includes('last month')) {
    const base = nowManila.minus({ months: 1 });
    return {
      label: 'last month',
      start: base.startOf('month'),
      end: base.endOf('month'),
    };
  }

  if (normalized.includes('this month')) {
    return {
      label: 'this month',
      start: nowManila.startOf('month'),
      end: nowManila.endOf('month'),
    };
  }

  if (normalized.includes('today')) {
    return {
      label: 'today',
      start: nowManila.startOf('day'),
      end: nowManila.endOf('day'),
    };
  }

  const dayMatch = normalized.match(/last\s+(\d+)\s+days?/);
  if (dayMatch) {
    const days = Number(dayMatch[1]);
    if (!Number.isNaN(days) && days > 0) {
      return {
        label: `last ${days} days`,
        start: nowManila.minus({ days }).startOf('day'),
        end: nowManila.endOf('day'),
      };
    }
  }

  return null;
}

function parseTypeFilter(question: string): IAssignment | null {
  const normalized = question.toLowerCase();

  if (normalized.includes('chicky')) return IAssignment.CHICKY_OINK;
  if (normalized.includes('imagawayaki')) return IAssignment.IMAGAWAYAKI;
  if (normalized.includes('hwrg eggs') || normalized.includes('eggs')) {
    return IAssignment.HWRG_EGGS;
  }
  if (normalized.includes('potato fry') || normalized.includes('potatofry')) {
    return IAssignment.POTATO_FRY;
  }

  return null;
}

function getTotalSalesByType(row: SalesReportRow) {
  const sales = row.sales;
  if (!sales || typeof sales !== 'object') {
    return Number(row.cash ?? 0);
  }

  try {
    switch (row.type) {
      case IAssignment.CHICKY_OINK:
        return getChickyOinkTotalSales(sales as ChickyOinkSales);
      case IAssignment.IMAGAWAYAKI:
        return getImagawayakiTotalSales(sales as ImagawayakiSales);
      case IAssignment.HWRG_EGGS:
        return getHWRGEggsTotalSales(sales as IHWRGEggsSales);
      case IAssignment.POTATO_FRY:
        return getPotatoFryTotalSales(sales as PotatoFrySales);
      default:
        return Number(row.cash ?? 0);
    }
  } catch {
    return Number(row.cash ?? 0);
  }
}

function buildFallbackAnswer(question: string, snapshot: AssistantSnapshot) {
  const normalized = question.toLowerCase();

  if (
    normalized.includes('not clock') ||
    normalized.includes('missing') ||
    normalized.includes('late')
  ) {
    if (snapshot.timelogsToday.missingClockInCount === 0) {
      return `All active employees have already clocked in for ${snapshot.date}.`;
    }

    const people = snapshot.timelogsToday.missingClockInEmployees
      .map(
        (emp, index) =>
          `${index + 1}. ${emp.name} (${emp.assignment ?? 'No assignment'})`,
      )
      .join('\n');

    return [
      `As of ${snapshot.date} (${snapshot.timeZone}), ${snapshot.timelogsToday.missingClockInCount} active employee(s) have not clocked in yet:`,
      people,
    ].join('\n\n');
  }

  if (normalized.includes('active') && normalized.includes('employee')) {
    return `There are ${snapshot.employees.active} active employees out of ${snapshot.employees.total} total employee records.`;
  }

  if (normalized.includes('inactive') && normalized.includes('employee')) {
    return `There are ${snapshot.employees.inactive} inactive employees.`;
  }

  if (normalized.includes('branch')) {
    return `There are ${snapshot.branches.total} branches: ${snapshot.branches.names.join(', ') || 'No branches found'}.`;
  }

  if (snapshot.salesSummary && normalized.includes('sales')) {
    const byTypeText = snapshot.salesSummary.byType.length
      ? snapshot.salesSummary.byType
          .map((item) => `${item.type}: ${item.totalSales.toLocaleString()}`)
          .join('\n')
      : 'No breakdown available.';

    return [
      `Total sales for ${snapshot.salesSummary.periodLabel} (${snapshot.salesSummary.startDate} to ${snapshot.salesSummary.endDate}): ${snapshot.salesSummary.totalSales.toLocaleString()}`,
      `Reports included: ${snapshot.salesSummary.reportCount}`,
      `Breakdown:\n${byTypeText}`,
    ].join('\n\n');
  }

  return [
    "I can answer admin questions using current users, branches, and today's timelog data.",
    `Right now: ${snapshot.employees.active} active employees, ${snapshot.timelogsToday.missingClockInCount} active employees missing clock-in today, and ${snapshot.branches.total} branches.`,
  ].join('\n');
}

async function generateAnswer(question: string, snapshot: AssistantSnapshot) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return buildFallbackAnswer(question, snapshot);
  }

  try {
    const model = process.env.OPENAI_MODEL ?? 'gpt-4o-mini';
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        messages: [
          {
            role: 'system',
            content:
              'You are an internal HWRG admin assistant. Answer based only on the provided data snapshot. If data is not present, say it is unavailable. Keep responses concise and practical.',
          },
          {
            role: 'user',
            content: `Question: ${question}\n\nData snapshot:\n${JSON.stringify(snapshot, null, 2)}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      return buildFallbackAnswer(question, snapshot);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    return content?.trim() || buildFallbackAnswer(question, snapshot);
  } catch {
    return buildFallbackAnswer(question, snapshot);
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const question =
    typeof body?.question === 'string' ? body.question.trim() : '';

  if (!question) {
    return NextResponse.json(
      { error: 'Question is required.' },
      { status: 400 },
    );
  }

  const nowManila = DateTime.now().setZone('Asia/Manila');
  const requestedSalesPeriod = parseSalesPeriod(question, nowManila);
  const typeFilter = parseTypeFilter(question);
  const startUtcISO = nowManila.startOf('day').toUTC().toISO();
  const endUtcISO = nowManila.endOf('day').toUTC().toISO();

  if (!startUtcISO || !endUtcISO) {
    return NextResponse.json(
      { error: 'Failed to compute date range.' },
      { status: 500 },
    );
  }

  const supabase = getSupabase();
  let salesSummary: AssistantSnapshot['salesSummary'];

  if (requestedSalesPeriod) {
    let salesQuery = supabase
      .from('sales_reports')
      .select('type, sales, cash, report_date')
      .gte('report_date', requestedSalesPeriod.start.toFormat('yyyy-LL-dd'))
      .lte('report_date', requestedSalesPeriod.end.toFormat('yyyy-LL-dd'));

    if (typeFilter) {
      salesQuery = salesQuery.eq('type', typeFilter);
    }

    const { data: salesRows, error: salesError } = await salesQuery;

    if (salesError) {
      return NextResponse.json({ error: salesError.message }, { status: 500 });
    }

    const totals = new Map<string, number>();
    let grandTotal = 0;

    for (const row of (salesRows ?? []) as SalesReportRow[]) {
      const total = getTotalSalesByType(row);
      grandTotal += total;
      totals.set(row.type, (totals.get(row.type) ?? 0) + total);
    }

    salesSummary = {
      periodLabel: requestedSalesPeriod.label,
      startDate: requestedSalesPeriod.start.toFormat('yyyy-LL-dd'),
      endDate: requestedSalesPeriod.end.toFormat('yyyy-LL-dd'),
      reportCount: (salesRows ?? []).length,
      totalSales: grandTotal,
      byType: [...totals.entries()].map(([type, totalSales]) => ({
        type,
        totalSales,
      })),
    };
  }

  const [usersResult, branchesResult, timelogsResult] = await Promise.all([
    supabase
      .from('users')
      .select('id, name, email, assignment, type, is_active')
      .in('type', ['employee', 'inventory_checker']),
    supabase.from('branches').select('id, branch_name'),
    supabase
      .from('timelogs')
      .select('user_id')
      .gte('clock_in', startUtcISO)
      .lte('clock_in', endUtcISO),
  ]);

  if (usersResult.error || branchesResult.error || timelogsResult.error) {
    const message =
      usersResult.error?.message ||
      branchesResult.error?.message ||
      timelogsResult.error?.message ||
      'Failed to fetch assistant context.';

    return NextResponse.json({ error: message }, { status: 500 });
  }

  const employees = (usersResult.data ?? []) as Employee[];
  const activeEmployees = employees.filter((employee) => employee.is_active);
  const clockedInUserIds = new Set(
    (timelogsResult.data ?? []).map((timelog) => timelog.user_id),
  );

  const missingClockInEmployees = activeEmployees
    .filter((employee) => !clockedInUserIds.has(employee.id))
    .map(({ id, name, assignment }) => ({ id, name, assignment }));

  const snapshot: AssistantSnapshot = {
    date: nowManila.toFormat('yyyy-LL-dd HH:mm'),
    timeZone: 'Asia/Manila',
    employees: {
      total: employees.length,
      active: activeEmployees.length,
      inactive: employees.length - activeEmployees.length,
    },
    branches: {
      total: (branchesResult.data ?? []).length,
      names: (branchesResult.data ?? []).map((branch) => branch.branch_name),
    },
    timelogsToday: {
      clockedInActiveCount:
        activeEmployees.length - missingClockInEmployees.length,
      missingClockInCount: missingClockInEmployees.length,
      missingClockInEmployees,
    },
    ...(salesSummary ? { salesSummary } : {}),
  };

  const answer = await generateAnswer(question, snapshot);

  return NextResponse.json({ answer, snapshot });
}
