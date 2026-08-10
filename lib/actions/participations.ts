"use server";

import { and, asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  actualStatuses,
  guildMembers,
  participations,
  plannedStatuses,
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

export async function saveParticipation(
  scheduleId: number,
  memberId: number,
  formData: FormData
) {
  await requireAdmin();
  const plannedStatus = String(
    formData.get("plannedStatus")
  ) as (typeof plannedStatuses)[number];
  const actualStatusRaw = String(formData.get("actualStatus") ?? "");
  const actualStatus = (actualStatuses as readonly string[]).includes(actualStatusRaw)
    ? (actualStatusRaw as (typeof actualStatuses)[number])
    : null;
  const partyName = String(formData.get("partyName") ?? "") || null;
  const role = String(formData.get("role") ?? "") || null;
  const ticketStatusRaw = String(formData.get("ticketStatus") ?? "");
  const ticketStatus = (ticketStatuses as readonly string[]).includes(ticketStatusRaw)
    ? (ticketStatusRaw as (typeof ticketStatuses)[number])
    : null;

  await db
    .insert(participations)
    .values({
      scheduleId,
      memberId,
      plannedStatus,
      actualStatus,
      partyName,
      role,
      ticketStatus,
    })
    .onConflictDoUpdate({
      target: [participations.scheduleId, participations.memberId],
      set: { plannedStatus, actualStatus, partyName, role, ticketStatus },
    });

  revalidatePath(`/admin/schedules/${scheduleId}/participation`);
  revalidatePath(`/admin/schedules/${scheduleId}/dungeon`);
}
