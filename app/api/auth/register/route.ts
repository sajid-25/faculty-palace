import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSession, attachSessionCookie } from "../../../../lib/auth";
import { db } from "../../../../lib/db";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const role = "faculty";

    if (!name || !email || password.length < 6 || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Name, valid email, and a password of at least 6 characters are required." }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const result = await db.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role",
      [name, email, passwordHash, role],
    );
    const session = await createSession(result.rows[0].id);
    const response = NextResponse.json({ user: result.rows[0] }, { status: 201 });
    attachSessionCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }
    if (error && typeof error === "object" && "code" in error && (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND")) {
      return NextResponse.json({ error: "PostgreSQL is not running. Start it with `docker compose up -d postgres` and try again." }, { status: 503 });
    }
    console.error("Registration failed", error);
    return NextResponse.json({ error: "Unable to create the account." }, { status: 500 });
  }
}