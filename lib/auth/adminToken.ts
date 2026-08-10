import { createHmac, timingSafeEqual } from "node:crypto";

// Pure token helpers with no next/headers dependency so proxy.ts can import them.
export const ADMIN_COOKIE_NAME = "raven_admin_session";
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

function signature(expiresAt: number): Buffer {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET is not set");
  return createHmac("sha256", secret).update(`admin.${expiresAt}`).digest();
}

export function signAdminToken(): string {
  const expiresAt = Math.floor(Date.now() / 1000) + ADMIN_SESSION_MAX_AGE_SECONDS;
  return `${expiresAt}.${signature(expiresAt).toString("hex")}`;
}

export function verifyAdminToken(token: string): boolean {
  const [expiresAtRaw, signatureHex] = token.split(".");
  if (!expiresAtRaw || !signatureHex) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isInteger(expiresAt)) return false;

  const expectedBuf = signature(expiresAt);
  const actualBuf = Buffer.from(signatureHex, "hex");
  if (expectedBuf.length !== actualBuf.length || !timingSafeEqual(expectedBuf, actualBuf)) {
    return false;
  }

  return expiresAt > Math.floor(Date.now() / 1000);
}
