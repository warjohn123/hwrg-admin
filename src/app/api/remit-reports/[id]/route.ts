import { handleCors } from '@/lib/cors';
import { sumKeyValueArray } from '@/lib/sumKeyValueArray';
import { sumSalesRemits } from '@/lib/sumSalesRemits';
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
  const { id } = await params;

  const { data, error } = await getSupabase()
    .from('remit_reports')
    .select('*, remit_expenses(*), remit_add_ons(*)')
    .eq('id', id)
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  const salesTotal = sumSalesRemits(data.sales);
  const expensesTotal = sumKeyValueArray(
    (data.remit_expenses as [{ [value: string]: number }]) || [],
  );
  const addOnsTotal = sumKeyValueArray(
    (data.remit_add_ons as [{ [value: string]: number }]) || [],
  );

  return NextResponse.json(
    {
      ...data,
      totals: { remit_total: salesTotal + addOnsTotal - expensesTotal },
    },
    { headers: cors?.headers, status: 200 },
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const cors = handleCors(req);
  const { id } = await params;

  const { error } = await getSupabase()
    .from('remit_reports')
    .delete()
    .eq('id', id);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(
    { message: 'Remit report deleted successfully' },
    { status: 200, headers: cors?.headers },
  );
}
