"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  dungeonClearResults,
  dungeonDifficulties,
  guildDungeonRuns,
  lootDistributionStatuses,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";

export async function getDungeonRun(scheduleId: number) {
  const [run] = await db
    .select()
    .from(guildDungeonRuns)
    .where(eq(guildDungeonRuns.scheduleId, scheduleId));
  return run;
}

export async function saveDungeonRun(scheduleId: number, formData: FormData) {
  await requireAdmin();
  const difficulty = String(
    formData.get("difficulty") ?? "normal"
  ) as (typeof dungeonDifficulties)[number];
  const clearResultRaw = String(formData.get("clearResult") ?? "");
  const clearResult = (dungeonClearResults as readonly string[]).includes(clearResultRaw)
    ? (clearResultRaw as (typeof dungeonClearResults)[number])
    : null;
  const loot = String(formData.get("loot") ?? "") || null;
  const distributionStatus = String(
    formData.get("distributionStatus") ?? "undistributed"
  ) as (typeof lootDistributionStatuses)[number];

  await db
    .insert(guildDungeonRuns)
    .values({ scheduleId, difficulty, clearResult, loot, distributionStatus })
    .onConflictDoUpdate({
      target: guildDungeonRuns.scheduleId,
      set: { difficulty, clearResult, loot, distributionStatus },
    });

  revalidatePath(`/admin/schedules/${scheduleId}/dungeon`);
}
