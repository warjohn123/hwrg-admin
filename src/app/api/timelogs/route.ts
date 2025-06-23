import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("limit") || "10");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (!user_id) {
    const { data, error, count } = await supabase
      .from("timelogs")
      .select("*", { count: "exact", head: false })
      .eq("user_id", user_id)
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timelogs: data, total: count ?? 0 });
  } else {
    const { data, error, count } = await supabase
      .from("timelogs")
      .select("*", { count: "exact", head: false })
      .range(from, to);

    console.log("data", data);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timelogs: data, total: count ?? 0 });
  }
}
