import { NextResponse } from "next/server";
import { clearSessionCookie, deleteCurrentSession } from "../../../../lib/auth";

export async function POST() {
  try {
    await deleteCurrentSession();
    const response = NextResponse.json({ ok: true });
    clearSessionCookie(response);
    return response;
  } catch (error) {
    console.error("Logout failed", error);
    return NextResponse.json({ error: "Unable to sign out." }, { status: 500 });
  }
}