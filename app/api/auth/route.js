import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

export async function POST(request) {
  const { password = "" } = await request.json();
  const expected = process.env.AUTH_PASSWORD_HASH || "";
  const salt = process.env.AUTH_PASSWORD_SALT || "";
  if (!expected || !salt || password.length > 100) return NextResponse.json({ error: "Authentication is not configured." }, { status: 503 });

  const supplied = scryptSync(password, salt, 64);
  const expectedBuffer = Buffer.from(expected, "hex");
  if (expectedBuffer.length !== supplied.length || !timingSafeEqual(supplied, expectedBuffer)) {
    await new Promise((resolve) => setTimeout(resolve, 450));
    return NextResponse.json({ error: "That password is not correct." }, { status: 401 });
  }

  const expires = String(Date.now() + 1000 * 60 * 60 * 24 * 7);
  const signature = createHmac("sha256", process.env.SESSION_SECRET).update(expires).digest("hex");
  const response = NextResponse.json({ ok: true });
  response.cookies.set("birdtrack_session", `${expires}.${signature}`, {
    httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production",
    path: "/", maxAge: 60 * 60 * 24 * 7
  });
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("birdtrack_session", "", { httpOnly: true, path: "/", maxAge: 0 });
  return response;
}
