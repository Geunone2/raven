"use server";

import { asc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { bossTimerTypes, bossTimers } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";
import { localInputToIso } from "@/lib/time";

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
  // raw는 <input type="datetime-local">이 주는 KST 벽시계 시간 문자열이다 —
  // new Date(raw)로 그냥 파싱하면 서버 런타임의 시간대(Vercel은 UTC)로 잘못
  // 해석돼 실제보다 9시간 어긋난 시각이 저장되는 버그가 있었다(2026-08-15 수정).
  const lastKilledAt = raw ? localInputToIso(raw) : new Date().toISOString();

  await db.update(bossTimers).set({ lastKilledAt }).where(eq(bossTimers.id, id));
  revalidatePath("/admin/boss-timers");
  revalidatePath(`/admin/boss-timers/${id}`);
  revalidatePath("/");
}
