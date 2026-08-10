import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "raven_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function sign(memberId: number): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const signature = createHmac("sha256", secret).update(String(memberId)).digest("hex");
  return `${memberId}.${signature}`;
}

function verify(token: string): number | null {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  const [memberIdRaw, signature] = token.split(".");
  if (!memberIdRaw || !signature) return null;

  const expected = createHmac("sha256", secret).update(memberIdRaw).digest("hex");
  const expectedBuf = Buffer.from(expected, "hex");
  const actualBuf = Buffer.from(signature, "hex");
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    return null;
  }

  const memberId = Number(memberIdRaw);
  return Number.isInteger(memberId) ? memberId : null;
}

export async function createSessionCookie(memberId: number) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, sign(memberId), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function getSessionMemberId(): Promise<number | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verify(token);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
