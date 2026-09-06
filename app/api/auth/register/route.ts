import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    if (!name || !email || password.length < 6 || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Name, valid email, and a password of at least 6 characters are required." }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, role: "faculty" } },
    });

    if (error) {
      if (error.message.toLowerCase().includes("rate limit") || error.message.toLowerCase().includes("email limit")) {
        return NextResponse.json({ error: "Supabase email limit reached. Wait before trying again, or disable email confirmation while developing." }, { status: 429 });
      }
      const status = error.message.toLowerCase().includes("already") ? 409 : 400;
      return NextResponse.json({ error: error.message }, { status });
    }
    if (!data.user) return NextResponse.json({ error: "Supabase did not create the account." }, { status: 500 });
    if (!data.session) {
      return NextResponse.json({ error: "Account created. Confirm your email in Supabase, then sign in." }, { status: 202 });
    }

    return NextResponse.json({ user: { id: data.user.id, name, email, role: "faculty" } }, { status: 201 });
  } catch (error) {
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Unable to connect to Supabase. Check your environment variables." }, { status: 503 });
  }
}