import { supabase } from "@/lib/supabase";
import { NextResponse } from "next/server";

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { user_id, clock_out_photo } = body;

    if (!user_id) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Insert into 'users' table
    const { data, error: dbError } = await supabase
      .from("timelogs")
      .update({ clock_out: new Date().toISOString(), clock_out_photo })
      .eq("user_id", user_id)
      .is("clock_out", null)
      .order("clock_in", { ascending: false })
      .limit(1);

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Clock out successful",
      user: data?.[0],
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
