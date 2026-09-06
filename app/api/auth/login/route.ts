import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession, attachSessionCookie } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const result = await db.query("SELECT id, name, email, role, password_hash FROM users WHERE email = $1", [email]);
    const account = result.rows[0];

    if (!account || !(await bcrypt.compare(password, account.password_hash))) {
      return NextResponse.json({ error: "Invalid email or password." }, { status: 401 });
    }

    const session = await createSession(account.id);
    const response = NextResponse.json({
      user: { id: account.id, name: account.name, email: account.email, role: account.role },
    });
    attachSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    console.error("Login failed", error);
    return NextResponse.json({ error: "Unable to sign in." }, { status: 500 });
  }
}