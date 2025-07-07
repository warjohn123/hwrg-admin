import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("limit") || "10");

  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  if (user_id) {
    const { data, error, count } = await supabase
      .from("timelogs")
      .select("*", { count: "exact", head: false })
      .eq("user_id", user_id)
      .order("created_at", { ascending: false }) // descending order
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timelogs: data, total: count ?? 0 });
  } else {
    const { data, error, count } = await supabase
      .from("timelogs")
      .select("*, users (id, name)", { count: "exact", head: false })
      .order("created_at", { ascending: false }) // descending order
      .range(from, to);

    console.log("data test", data);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ timelogs: data, total: count ?? 0 });
  }
}
