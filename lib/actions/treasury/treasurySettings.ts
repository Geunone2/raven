"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { NOW_UTC_TEXT, treasurySettings } from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";

// 정산 비율은 딱 하나의 행(싱글턴)으로만 관리한다. 아직 한 번도 저장한 적이
// 없으면(테이블이 비어 있으면) 스키마 기본값으로 즉시 하나 만들어서 돌려준다 —
// 그래야 이 값을 쓰는 정산 로직들이 항상 값을 받을 수 있다.
export async function getTreasurySettings() {
  const [row] = await db.select().from(treasurySettings).limit(1);
  if (row) return row;
  const [seeded] = await db.insert(treasurySettings).values({}).returning();
  return seeded;
}

function parsePercent(formData: FormData, name: string, fallback: number): number {
  const raw = formData.get(name);
  const value = raw != null ? Number(raw) : NaN;
  return Number.isFinite(value) && value >= 0 ? value : fallback;
}

export async function updateTreasurySettings(formData: FormData) {
  await requireAdmin();
  const current = await getTreasurySettings();

  await db
    .update(treasurySettings)
    .set({
      saleTaxRate: parsePercent(formData, "saleTaxRate", current.saleTaxRate),
      reserveRatio: parsePercent(formData, "reserveRatio", current.reserveRatio),
      adminFeeRatio: parsePercent(formData, "adminFeeRatio", current.adminFeeRatio),
      participationRewardRatio: parsePercent(
        formData,
        "participationRewardRatio",
        current.participationRewardRatio
      ),
      powerRewardRatio: parsePercent(formData, "powerRewardRatio", current.powerRewardRatio),
      updatedAt: NOW_UTC_TEXT,
    })
    .where(eq(treasurySettings.id, current.id));

  revalidatePath("/admin/settings");
  revalidatePath("/admin/bank");
  revalidatePath("/admin/loots");
  revalidatePath("/bank");
}
