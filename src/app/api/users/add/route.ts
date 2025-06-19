import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, name, type, assignment } = body;

    if (!email || !password || !name) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }
    console.log("email", email);
    console.log("password", password);

    // Create Auth user
    const { data: authUser, error: authError } =
      await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Set to false if you want email confirmation
      });

    if (authError || !authUser.user) {
      return NextResponse.json(
        { error: authError?.message || "Auth creation failed" },
        { status: 500 }
      );
    }

    // Insert into 'users' table
    const { data, error: dbError } = await supabase
      .from("users")
      .insert([{ id: authUser.user.id, name, email, type, assignment }]); // Ensure your table has a UUID 'id' column

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "User created successfully",
      user: data?.[0],
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
