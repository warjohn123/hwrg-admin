import { supabase } from "@/lib/supabase";
import { NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  console.log("id", id);

  const { data, error } = await supabase
    .from("users") // your custom users table
    .select("*")
    .eq("id", id)
    .single();

  if (error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });

  return new Response(JSON.stringify(data), { status: 200 });
}
