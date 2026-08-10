"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { redirect } from "next/navigation";
import {
  clearAdminSessionCookie,
  createAdminSessionCookie,
} from "@/lib/auth/adminSession";

// Hash both sides so lengths are equal and the comparison stays constant-time.
function safeEquals(a: string, b: string): boolean {
  return timingSafeEqual(
    createHash("sha256").update(a).digest(),
    createHash("sha256").update(b).digest()
  );
}

export async function adminLogin(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (
    !adminEmail ||
    !adminPassword ||
    !safeEquals(email, adminEmail) ||
    !safeEquals(password, adminPassword)
  ) {
    redirect("/admin/login?error=1");
  }

  await createAdminSessionCookie();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSessionCookie();
  redirect("/admin/login");
}
