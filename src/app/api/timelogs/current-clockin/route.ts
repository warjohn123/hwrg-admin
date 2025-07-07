import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");

  const now = new Date();
  const startUTC = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
  ).toISOString();
  const endUTC = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      23,
      59,
      59
    )
  ).toISOString();

  const { data, error } = await supabase
    .from("timelogs")
    .select("*")
    .eq("user_id", user_id)
    .gte("clock_in", startUTC)
    .lte("clock_in", endUTC)
    .is("clock_out", null)
    .limit(1);

  console.log("data", data);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
