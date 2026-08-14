"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  guildMembers,
  participations,
  participationStatuses,
  ticketStatuses,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";

export async function getParticipationsForSchedule(scheduleId: number) {
  const rows = await db
    .select({ member: guildMembers, participation: participations })
    .from(guildMembers)
    .leftJoin(
      participations,
      and(
        eq(participations.memberId, guildMembers.id),
        eq(participations.scheduleId, scheduleId)
      )
    )
    .orderBy(asc(guildMembers.nickname));

  return rows;
}

// 참여 체크 표 전체를 한 번에 저장 — 행마다 name을 status_${memberId} /
// ticketStatus_${memberId}로 구분해서 하나의 폼에 다 담아 보낸다. 그 필드가
// 폼에 아예 없는 회원(화면에 안 그려졌던 경우 등)은 건드리지 않고 건너뛴다.
export async function saveParticipationsBulk(scheduleId: number, formData: FormData) {
  await requireAdmin();
  const members = await db.select({ id: guildMembers.id }).from(guildMembers);

  // Postgres(postgres-js) 트랜잭션은 async 콜백을 지원한다 — 이전 SQLite/
  // better-sqlite3는 동기 콜백만 됐어서 이 부분이 달랐다(2026-08-15 이관).
  await db.transaction(async (tx) => {
    for (const { id: memberId } of members) {
      const statusKey = `status_${memberId}`;
      const ticketKey = `ticketStatus_${memberId}`;
      if (!formData.has(statusKey) && !formData.has(ticketKey)) continue;

      const statusRaw = String(formData.get(statusKey) ?? "");
      const status = (participationStatuses as readonly string[]).includes(statusRaw)
        ? (statusRaw as (typeof participationStatuses)[number])
        : null;
      const ticketStatusRaw = String(formData.get(ticketKey) ?? "");
      const ticketStatus = (ticketStatuses as readonly string[]).includes(ticketStatusRaw)
        ? (ticketStatusRaw as (typeof ticketStatuses)[number])
        : null;

      await tx
        .insert(participations)
        .values({ scheduleId, memberId, status, ticketStatus })
        .onConflictDoUpdate({
          target: [participations.scheduleId, participations.memberId],
          set: { status, ticketStatus },
        });
    }
  });

  revalidatePath(`/admin/schedules/${scheduleId}/participation`);
  revalidatePath(`/admin/schedules/${scheduleId}/dungeon`);
}
