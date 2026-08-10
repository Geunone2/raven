"use server";

import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { bossTimerTypes, bossTimers } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";

export async function getBossTimers() {
  return db.select().from(bossTimers).orderBy(asc(bossTimers.id));
}

export async function getBossTimer(id: number) {
  const [boss] = await db.select().from(bossTimers).where(eq(bossTimers.id, id));
  return boss;
}

function parseBossTimerForm(formData: FormData) {
  return {
    name: String(formData.get("name") ?? "").trim(),
    type: String(formData.get("type") ?? "fixed") as (typeof bossTimerTypes)[number],
    fixedTime: String(formData.get("fixedTime") ?? "") || null,
    respawnMinutes: formData.get("respawnMinutes")
      ? Number(formData.get("respawnMinutes"))
      : null,
    memo: String(formData.get("memo") ?? "").trim() || null,
  };
}

export async function createBossTimer(formData: FormData) {
  await requireAdmin();
  const values = parseBossTimerForm(formData);
  await db.insert(bossTimers).values(values);
  revalidatePath("/admin/boss-timers");
  revalidatePath("/");
  redirect("/admin/boss-timers");
}

export async function updateBossTimer(id: number, formData: FormData) {
  await requireAdmin();
  const values = parseBossTimerForm(formData);
  await db.update(bossTimers).set(values).where(eq(bossTimers.id, id));
  revalidatePath("/admin/boss-timers");
  revalidatePath("/");
  redirect("/admin/boss-timers");
}

export async function deleteBossTimer(id: number) {
  await requireAdmin();
  await db.delete(bossTimers).where(eq(bossTimers.id, id));
  revalidatePath("/admin/boss-timers");
  revalidatePath("/");
  redirect("/admin/boss-timers");
}

export async function recordBossKill(id: number, formData: FormData) {
  await requireAdmin();
  const raw = String(formData.get("lastKilledAt") ?? "");
  const lastKilledAt = raw ? new Date(raw).toISOString() : new Date().toISOString();

  await db.update(bossTimers).set({ lastKilledAt }).where(eq(bossTimers.id, id));
  revalidatePath("/admin/boss-timers");
  revalidatePath(`/admin/boss-timers/${id}`);
  revalidatePath("/");
}
