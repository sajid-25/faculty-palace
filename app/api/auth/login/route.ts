import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, name, role")
      .eq("id", data.user.id)
      .single();
    if (profileError || !profile) return NextResponse.json({ error: "Your account profile is not configured." }, { status: 500 });

    return NextResponse.json({ user: { ...profile, email: data.user.email } });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to connect to Supabase. Check your environment variables." }, { status: 503 });
  }
}