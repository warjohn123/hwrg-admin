import { handleCors } from '@/lib/cors';
import { getSupabase } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { searchParams } = new URL(req.url);
  const { id } = await params;

  const { data: assignments, error: assignmentError } = await getSupabase()
    .from('branch_assignments')
    .select('branch_id')
    .eq('user_id', id);

  if (assignmentError) {
    console.error(assignmentError);
    return NextResponse.json(
      { error: assignmentError.message },
      { status: 500, headers: cors?.headers },
    );
  }

  const branchIds = assignments.map((a) => a.branch_id);

  const page = parseInt(searchParams.get('page') || '1');
  const pageSize = parseInt(searchParams.get('limit') || '10');

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  const { data, error, count } = await getSupabase()
    .from('sales_reports')
    .select('id, title, report_date, created_at', {
      count: 'exact',
      head: false,
    })
    .in('branch_id', branchIds)
    .range(from, to);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { sales_reports: data, total: count ?? 0 },
    { headers: cors?.headers, status: 200 },
  );
}
