"use server";

import { and, eq, gte, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  ScheduleCheckin,
  attendanceStatuses,
  contentSchedules,
  guildMembers,
  scheduleCheckins,
} from "@/lib/db/schema";
import { getSessionMemberId } from "@/lib/auth/session";
import { redirect } from "next/navigation";
import {
  getCheckinPoints,
  getScheduleBasePoints,
  isScheduleCheckinClosed,
  type ScheduleCheckinResult,
} from "@/lib/constants/schedules";
import type { contentTypes } from "@/lib/db/schema";
import { getGuildServer } from "@/lib/constants/members";
import { attendanceStatusLabels } from "@/lib/constants/attendance";
import { getCurrentBiweekRange } from "@/lib/time";

export async function getMyScheduleCheckins(memberId: number, scheduleIds: number[]) {
  if (scheduleIds.length === 0) return new Map<number, ScheduleCheckin>();
  const rows = await db
    .select()
    .from(scheduleCheckins)
    .where(eq(scheduleCheckins.memberId, memberId));
  return new Map(
    rows.filter((row) => scheduleIds.includes(row.scheduleId)).map((row) => [row.scheduleId, row])
  );
}

export type ScheduleCheckinRosterEntry = {
  nickname: string;
  status: (typeof attendanceStatuses)[number];
};

// 일정별 출석/중간합류 명단 (출석취소는 명단에서 제외).
export async function getScheduleCheckinRoster(scheduleIds: number[]) {
  if (scheduleIds.length === 0) return new Map<number, ScheduleCheckinRosterEntry[]>();

  const rows = await db
    .select({
      scheduleId: scheduleCheckins.scheduleId,
      status: scheduleCheckins.status,
      nickname: guildMembers.nickname,
    })
    .from(scheduleCheckins)
    .innerJoin(guildMembers, eq(scheduleCheckins.memberId, guildMembers.id))
    .where(inArray(scheduleCheckins.scheduleId, scheduleIds));

  const rosterByScheduleId = new Map<number, ScheduleCheckinRosterEntry[]>();
  for (const row of rows) {
    if (row.status !== "checked_in" && row.status !== "mid_join") continue;
    const list = rosterByScheduleId.get(row.scheduleId) ?? [];
    list.push({ nickname: row.nickname, status: row.status });
    rosterByScheduleId.set(row.scheduleId, list);
  }
  return rosterByScheduleId;
}

export type ContributionStats = {
  myPoints: number;
  totalPoints: number;
  ratio: number;
  periodStart: string;
  periodEnd: string;
};

// 2주 단위로 초기화되는 출석 기여도 구간의 길드원별 참여 점수 합계. 내판 정산
// (길드 통장 분배)의 참여 보상 비율 계산에도 재사용된다.
export async function getMemberContributionPoints(): Promise<Map<number, number>> {
  const { start } = getCurrentBiweekRange();

  const rows = await db
    .select({ checkin: scheduleCheckins, schedule: contentSchedules })
    .from(scheduleCheckins)
    .innerJoin(contentSchedules, eq(scheduleCheckins.scheduleId, contentSchedules.id))
    .where(gte(contentSchedules.date, start));

  const pointsByMember = new Map<number, number>();
  for (const { checkin, schedule } of rows) {
    const { total } = getScheduleBasePoints(schedule);
    const points = getCheckinPoints(total, checkin.status);
    pointsByMember.set(checkin.memberId, (pointsByMember.get(checkin.memberId) ?? 0) + points);
  }
  return pointsByMember;
}

// 2주 단위로 초기화되는 출석 기여도 — 이번 구간에 등록된 일정의 체크인만 합산해,
// 내 점수가 길드 전체 합산 점수에서 차지하는 비율을 계산한다.
export async function getContributionStats(memberId: number): Promise<ContributionStats> {
  const { start, end } = getCurrentBiweekRange();
  const pointsByMember = await getMemberContributionPoints();

  const totalPoints = [...pointsByMember.values()].reduce((sum, points) => sum + points, 0);
  const myPoints = pointsByMember.get(memberId) ?? 0;

  const ratio = totalPoints > 0 ? Math.round((myPoints / totalPoints) * 1000) / 10 : 0;
  return { myPoints, totalPoints, ratio, periodStart: start, periodEnd: end };
}

export type ContentParticipationStats = {
  myPower: number;
  totalPower: number;
  myScore: number;
  totalScore: number;
};

// 고대성채/쟁탈전 "참여 시 예상 정산 몫" 계산기용 — 그 콘텐츠에 실제로 참여한
// 적 없는 인원 전체가 아니라, 이번 2주 구간 동안 해당 콘텐츠 일정에 실제로
// 출석/중간합류한 인원들만 모아 그 안에서의 전투력 비율과 보스 참여도(점수)
// 비율을 계산한다. 참여한 적이 없으면 두 비율 모두 자연히 0이 된다.
export async function getContentParticipationStats(
  memberId: number,
  contentType: (typeof contentTypes)[number]
): Promise<ContentParticipationStats> {
  const { start } = getCurrentBiweekRange();

  const rows = await db
    .select({ checkin: scheduleCheckins, schedule: contentSchedules, member: guildMembers })
    .from(scheduleCheckins)
    .innerJoin(contentSchedules, eq(scheduleCheckins.scheduleId, contentSchedules.id))
    .innerJoin(guildMembers, eq(scheduleCheckins.memberId, guildMembers.id))
    .where(
      and(
        gte(contentSchedules.date, start),
        eq(contentSchedules.type, contentType),
        inArray(scheduleCheckins.status, ["checked_in", "mid_join"])
      )
    );

  // 같은 사람이 이 기간에 해당 콘텐츠 일정에 여러 번 참여했을 수 있으니 참여
  // 점수는 합산하되, 전투력은 현재 스탯 기준 고정값이라 그대로 덮어써도 된다.
  const scoreByMember = new Map<number, number>();
  const powerByMember = new Map<number, number>();
  for (const { checkin, schedule, member } of rows) {
    const { total } = getScheduleBasePoints(schedule);
    const points = getCheckinPoints(total, checkin.status);
    scoreByMember.set(checkin.memberId, (scoreByMember.get(checkin.memberId) ?? 0) + points);
    powerByMember.set(checkin.memberId, member.attack + member.defense + member.accuracy);
  }

  const totalPower = [...powerByMember.values()].reduce((sum, power) => sum + power, 0);
  const totalScore = [...scoreByMember.values()].reduce((sum, score) => sum + score, 0);

  return {
    myPower: powerByMember.get(memberId) ?? 0,
    totalPower,
    myScore: scoreByMember.get(memberId) ?? 0,
    totalScore,
  };
}

export async function setMyScheduleCheckin(
  scheduleId: number,
  _prevState: ScheduleCheckinResult,
  formData: FormData
): Promise<ScheduleCheckinResult> {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const status = String(formData.get("status") ?? "") as (typeof attendanceStatuses)[number];
  if (!(attendanceStatuses as readonly string[]).includes(status)) {
    return { ok: false, message: "잘못된 요청입니다." };
  }

  const [schedule] = await db
    .select()
    .from(contentSchedules)
    .where(eq(contentSchedules.id, scheduleId));
  if (!schedule) {
    return { ok: false, message: "존재하지 않는 일정입니다." };
  }
  if (isScheduleCheckinClosed(schedule)) {
    return { ok: false, message: "출석 가능 시간(시작 후 6시간)이 지나 응답을 변경할 수 없습니다." };
  }

  const [member] = await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.id, memberId));
  const myServer = member ? getGuildServer(member.guildName) : null;
  if (schedule.serverName && myServer && schedule.serverName !== myServer) {
    return {
      ok: false,
      message: `${member?.guildName}(${myServer}) 소속은 ${schedule.serverName} 서버 일정에 출석할 수 없습니다.`,
    };
  }

  await db
    .insert(scheduleCheckins)
    .values({ scheduleId, memberId, status })
    .onConflictDoUpdate({
      target: [scheduleCheckins.scheduleId, scheduleCheckins.memberId],
      set: { status },
    });

  revalidatePath("/attendance");
  return { ok: true, message: `${attendanceStatusLabels[status]}(으)로 응답했습니다.` };
}
