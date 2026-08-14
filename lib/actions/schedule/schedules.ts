"use server";

import { and, asc, desc, eq, gte, inArray, lte } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  bossTiers,
  contentSchedules,
  contentTypes,
  SCHEDULE_TARGET_GUILDS,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";
import { dateStringWithOffset, todayDateString } from "@/lib/time";
import {
  isScheduleCheckinClosed,
  SCHEDULE_PERIOD_LOOKBACK_DAYS,
  type SchedulePeriod,
} from "@/lib/constants/schedule/schedules";

// period가 없으면(기존 호출부 — /schedule, /admin/loots/*) 날짜 제한 없이 전체를
// 내려준다. 관리자 일정표(/admin/schedules)만 명시적으로 period를 넘겨서
// "오늘 / 내일 / 하루 전 / 일주일 전까지 / 한달 전까지 / 전체"를 서버에서 직접 필터링한다.
export async function getSchedules(
  filters: { type?: string; period?: SchedulePeriod } = {}
) {
  const conditions = [];
  if (filters.type && (contentTypes as readonly string[]).includes(filters.type)) {
    conditions.push(eq(contentSchedules.type, filters.type as (typeof contentTypes)[number]));
  }
  if (filters.period === "tomorrow") {
    conditions.push(eq(contentSchedules.date, dateStringWithOffset(1)));
  } else if (filters.period && filters.period !== "all") {
    const from = dateStringWithOffset(-SCHEDULE_PERIOD_LOOKBACK_DAYS[filters.period]);
    const to = todayDateString();
    conditions.push(gte(contentSchedules.date, from));
    conditions.push(lte(contentSchedules.date, to));
  }

  return db
    .select()
    .from(contentSchedules)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(contentSchedules.date), asc(contentSchedules.startTime));
}

export async function getTodaySchedules() {
  const today = todayDateString();
  return db
    .select()
    .from(contentSchedules)
    .where(eq(contentSchedules.date, today))
    .orderBy(asc(contentSchedules.startTime));
}

// 출석체크 화면용 — 전날부터 오늘(00:00~23:59)까지의 일정만 노출한다.
export async function getSchedulesForCheckin() {
  const yesterday = dateStringWithOffset(-1);
  const today = dateStringWithOffset(0);
  const schedules = await db
    .select()
    .from(contentSchedules)
    .where(inArray(contentSchedules.date, [yesterday, today]))
    .orderBy(desc(contentSchedules.date), desc(contentSchedules.startTime));

  // 출석 가능 시간(시작 후 6시간)이 지난 일정은 응답을 받을 수 없으니 목록에서도 뺀다.
  return schedules.filter((schedule) => !isScheduleCheckinClosed(schedule));
}

export async function getSchedulesForMonth(year: number, month: number) {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

  return db
    .select()
    .from(contentSchedules)
    .where(and(gte(contentSchedules.date, start), lte(contentSchedules.date, end)))
    .orderBy(asc(contentSchedules.date), asc(contentSchedules.startTime));
}

export async function getSchedule(id: number) {
  const [schedule] = await db
    .select()
    .from(contentSchedules)
    .where(eq(contentSchedules.id, id));
  return schedule;
}

function parseScheduleForm(formData: FormData) {
  return {
    type: String(formData.get("type") ?? "guild_dungeon") as (typeof contentTypes)[number],
    title: String(formData.get("title") ?? "").trim(),
    date: String(formData.get("date") ?? ""),
    startTime: String(formData.get("startTime") ?? ""),
    targetGuild: String(
      formData.get("targetGuild") ?? "전체"
    ) as (typeof SCHEDULE_TARGET_GUILDS)[number],
    serverName: String(formData.get("serverName") ?? "").trim() || null,
    noticeText: String(formData.get("noticeText") ?? "") || null,
    bossTier: String(formData.get("bossTier") ?? "none") as (typeof bossTiers)[number],
    // 비워두면 null → getScheduleBasePoints가 보스 등급 기준 자동 계산값을 쓴다.
    bossPoints: formData.get("bossPoints")
      ? Number(formData.get("bossPoints"))
      : null,
    hasCombat: formData.get("hasCombat") === "on",
    combatHours: formData.get("combatHours")
      ? Number(formData.get("combatHours"))
      : null,
    hasAbyssDing: formData.get("hasAbyssDing") === "on",
  };
}

export async function createSchedule(formData: FormData) {
  await requireAdmin();
  const values = parseScheduleForm(formData);
  await db.insert(contentSchedules).values(values);
  revalidatePath("/admin/schedules");
  revalidatePath("/schedule");
  redirect("/admin/schedules");
}

export async function updateSchedule(id: number, formData: FormData) {
  await requireAdmin();
  const values = parseScheduleForm(formData);
  await db.update(contentSchedules).set(values).where(eq(contentSchedules.id, id));
  revalidatePath("/admin/schedules");
  revalidatePath("/schedule");
  redirect("/admin/schedules");
}

export async function deleteSchedule(id: number) {
  await requireAdmin();
  await db.delete(contentSchedules).where(eq(contentSchedules.id, id));
  revalidatePath("/admin/schedules");
  revalidatePath("/schedule");
  redirect("/admin/schedules");
}
