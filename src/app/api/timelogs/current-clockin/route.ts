import { NextRequest, NextResponse } from 'next/server';
import getUTCDateRangeForToday from '@/lib/getUTCDateRangeForToday';
import { getSupabase } from '@/lib/supabaseServer';
import { handleCors } from '@/lib/cors';

export async function OPTIONS(request: Request) {
  return handleCors(request)!; // handles preflight
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cors = handleCors(req);
  const user_id = searchParams.get('user_id');

  const { startUTC, endUTC } = getUTCDateRangeForToday('Asia/Manila');

  const { data, error } = await getSupabase()
    .from('timelogs')
    .select('*')
    .eq('user_id', user_id)
    .gte('clock_in', startUTC.toISOString())
    .lte('clock_in', endUTC.toISOString())
    .limit(1);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: cors?.headers },
    );
  }

  return NextResponse.json(data, { headers: cors?.headers });
}
