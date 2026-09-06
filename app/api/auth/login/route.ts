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

    if (profileError || !profile) {
      const fallbackName = String(data.user.user_metadata?.full_name || data.user.email?.split("@")[0] || "Faculty Member");
      const { data: createdProfile, error: createProfileError } = await supabase
        .from("profiles")
        .insert({ id: data.user.id, name: fallbackName, role: "faculty" })
        .select("id, name, role")
        .single();

      if (createProfileError || !createdProfile) {
        return NextResponse.json({ error: "Your Supabase profiles table is not configured. Run database/supabase.sql in the Supabase SQL Editor." }, { status: 500 });
      }

      return NextResponse.json({ user: { ...createdProfile, email: data.user.email } });
    }

    return NextResponse.json({ user: { ...profile, email: data.user.email } });
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to connect to Supabase. Check your environment variables." }, { status: 503 });
  }
}