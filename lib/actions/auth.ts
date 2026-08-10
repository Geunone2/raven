"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { guildMembers } from "@/lib/db/schema";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { clearSessionCookie, createSessionCookie } from "@/lib/auth/session";

export async function signup(formData: FormData) {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("passwordConfirm") ?? "");

  if (!nickname || password.length < 8 || password !== passwordConfirm) {
    redirect("/signup?error=invalid");
  }

  const [existing] = await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.nickname, nickname));
  if (existing) {
    redirect("/signup?error=duplicate");
  }

  const [member] = await db
    .insert(guildMembers)
    .values({ nickname, passwordHash: hashPassword(password) })
    .returning();

  await createSessionCookie(member.id);
  redirect("/ranking");
}

export async function login(formData: FormData) {
  const nickname = String(formData.get("nickname") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  const [member] = await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.nickname, nickname));

  if (!member || !verifyPassword(password, member.passwordHash)) {
    redirect("/login?error=1");
  }

  await createSessionCookie(member.id);
  redirect("/ranking");
}

export async function logout() {
  await clearSessionCookie();
  redirect("/login");
}
