"use server";

import { asc, desc, eq, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  bossTiers,
  characterTypes,
  contentSchedules,
  contentTypes,
  guildMembers,
  memberStatHistory,
  participations,
  participationStatuses,
} from "@/lib/db/schema";
import type { RankStat, UpdateStatsResult } from "@/lib/constants/member/members";
import { getParticipationPoints, getScheduleBasePoints } from "@/lib/constants/schedule/schedules";
import { getSessionMemberId } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/adminSession";

// 길드/서버/클래스/정렬 필터링은 클라이언트에서(MemberPanel.tsx의 버튼 칩)
// 처리한다 — 이 함수는 전체 목록을 한 번만 내려준다.
export async function getMembers() {
  return db.select().from(guildMembers).orderBy(desc(guildMembers.createdAt));
}

// 길드원 관리 화면의 "참여도 점수" 집계용 — participations를 일정(content_schedules)과
// 조인해 참여자별 획득 점수를 평평한 배열로 내려준다. 날짜 범위 필터는 클라이언트
// (MemberPanel)에서 이 배열을 다시 훑어 합산하는 방식으로 처리한다.
// isBoss: 해당 일정에 실제 보스 등급이 걸려 있었는지(bossTier !== "none") — "보스
// 참여도 누적 점수" 집계에 쓴다.
export type MemberContributionEntry = {
  memberId: number;
  scheduleId: number;
  date: string;
  points: number;
  isBoss: boolean;
};

// 회원별 집계 결과 — auto(자동 합계) + adjustment(운영진 보정값) = total(참여도 점수).
// bossScore는 별개 지표로, 실제 보스가 있던 일정에서만 얻은 점수 누적(2026-08-14,
// "보스 참여 누적 횟수"에서 점수 기준으로 변경).
export type MemberContributionTotal = {
  auto: number;
  adjustment: number;
  total: number;
  bossScore: number;
};

export async function getMemberParticipationContributions(): Promise<MemberContributionEntry[]> {
  const rows = await db
    .select({ participation: participations, schedule: contentSchedules })
    .from(participations)
    .innerJoin(contentSchedules, eq(participations.scheduleId, contentSchedules.id));

  const entries: MemberContributionEntry[] = [];
  for (const { participation, schedule } of rows) {
    const { total } = getScheduleBasePoints(schedule);
    const points = getParticipationPoints(total, participation.status);
    if (points <= 0) continue;
    entries.push({
      memberId: participation.memberId,
      scheduleId: schedule.id,
      date: schedule.date,
      points,
      isBoss: schedule.bossTier !== "none",
    });
  }
  return entries;
}

// 회원 수정 페이지의 "참여 이력" 목록용 — 이 회원이 participations 행을 가진
// 모든 일정을 최신순으로, 그때 무슨 상태(참석/중간합류/미참석/미체크)였고 점수를
// 얼마나 받았는지와 함께 내려준다. 집계(getMemberParticipationContributions)와
// 달리 0점짜리(미참석)도 포함해서 이력을 빠짐없이 보여준다.
export type MemberParticipationHistoryEntry = {
  scheduleId: number;
  scheduleTitle: string;
  date: string;
  type: (typeof contentTypes)[number];
  bossTier: (typeof bossTiers)[number];
  status: (typeof participationStatuses)[number] | null;
  points: number;
};

export async function getMemberParticipationHistory(
  memberId: number
): Promise<MemberParticipationHistoryEntry[]> {
  const rows = await db
    .select({ participation: participations, schedule: contentSchedules })
    .from(participations)
    .innerJoin(contentSchedules, eq(participations.scheduleId, contentSchedules.id))
    .where(eq(participations.memberId, memberId))
    .orderBy(desc(contentSchedules.date), desc(contentSchedules.startTime));

  return rows.map(({ participation, schedule }) => {
    const { total } = getScheduleBasePoints(schedule);
    return {
      scheduleId: schedule.id,
      scheduleTitle: schedule.title,
      date: schedule.date,
      type: schedule.type,
      bossTier: schedule.bossTier,
      status: participation.status,
      points: getParticipationPoints(total, participation.status),
    };
  });
}

export async function getMembersRanked() {
  return db.select().from(guildMembers).orderBy(desc(guildMembers.attack));
}

export async function getMemberRankings() {
  const members = await db.select().from(guildMembers);

  const byTotal = [...members].sort(
    (a, b) =>
      b.attack + b.defense + b.accuracy - (a.attack + a.defense + a.accuracy)
  );

  return {
    byTotal: byTotal.slice(0, 20),
    byAttack: [...members].sort((a, b) => b.attack - a.attack).slice(0, 10),
    byDefense: [...members].sort((a, b) => b.defense - a.defense).slice(0, 10),
    byAccuracy: [...members]
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 10),
  };
}

export async function getMember(id: number) {
  const [member] = await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.id, id));
  return member;
}

function parseMemberForm(formData: FormData) {
  const adjustmentRaw = String(formData.get("participationPointsAdjustment") ?? "0").trim();
  return {
    nickname: String(formData.get("nickname") ?? "").trim(),
    guildName: String(formData.get("guildName") ?? "").trim() || null,
    server: String(formData.get("server") ?? "").trim() || null,
    className: String(formData.get("className") ?? "").trim(),
    level: Number(formData.get("level") ?? 0),
    attack: Number(formData.get("attack") ?? 0),
    defense: Number(formData.get("defense") ?? 0),
    accuracy: Number(formData.get("accuracy") ?? 0),
    memo: String(formData.get("memo") ?? "") || null,
    participationPointsAdjustment:
      adjustmentRaw && Number.isFinite(Number(adjustmentRaw)) ? Math.round(Number(adjustmentRaw)) : 0,
  };
}

export async function updateMember(id: number, formData: FormData) {
  await requireAdmin();
  const values = parseMemberForm(formData);
  await db.update(guildMembers).set(values).where(eq(guildMembers.id, id));
  await db.insert(memberStatHistory).values({
    memberId: id,
    level: values.level,
    attack: values.attack,
    defense: values.defense,
    accuracy: values.accuracy,
  });
  revalidatePath("/admin/members");
  revalidatePath("/ranking");
  redirect("/admin/members");
}

export async function deleteMember(id: number) {
  await requireAdmin();
  await db.delete(guildMembers).where(eq(guildMembers.id, id));
  revalidatePath("/admin/members");
  revalidatePath("/ranking");
  redirect("/admin/members");
}

export async function updateOwnStats(
  _prevState: UpdateStatsResult,
  formData: FormData
): Promise<UpdateStatsResult> {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const characterType = String(
    formData.get("characterType") ?? "main"
  ) as (typeof characterTypes)[number];
  const level = Number(formData.get("level") ?? 0);
  const attack = Number(formData.get("attack") ?? 0);
  const defense = Number(formData.get("defense") ?? 0);
  const accuracy = Number(formData.get("accuracy") ?? 0);

  if (
    !Number.isFinite(level) ||
    !Number.isFinite(attack) ||
    !Number.isFinite(defense) ||
    !Number.isFinite(accuracy)
  ) {
    return { ok: false, message: "전투력 저장 중 문제가 발생했습니다." };
  }

  await db
    .update(guildMembers)
    .set({
      guildName: String(formData.get("guildName") ?? "").trim() || null,
      server: String(formData.get("server") ?? "").trim() || null,
      className: String(formData.get("className") ?? "").trim(),
      characterType: (characterTypes as readonly string[]).includes(characterType)
        ? characterType
        : "main",
      level,
      attack,
      defense,
      accuracy,
      statsUpdatedAt: sql`(current_timestamp)`,
    })
    .where(eq(guildMembers.id, memberId));
  await db.insert(memberStatHistory).values({ memberId, level, attack, defense, accuracy });

  revalidatePath("/ranking");
  revalidatePath(`/ranking/${memberId}`);
  return { ok: true, message: "저장되었습니다." };
}

// 인원 상세 페이지 상단 4개 카드(종합/공격력/방어력/명중)용 — 같은 길드 내
// 순위(guildRank/guildCount)와 전체 길드원 중 순위(totalRank/totalCount)를
// 스탯별로 계산한다.
export type MemberRankPositions = Record<
  RankStat,
  {
    value: number;
    guildRank: number;
    guildCount: number;
    totalRank: number;
    totalCount: number;
  }
>;

export async function getMemberRankPositions(memberId: number): Promise<MemberRankPositions | null> {
  const members = await db.select().from(guildMembers);
  const foundTarget = members.find((member) => member.id === memberId);
  if (!foundTarget) return null;
  const target = foundTarget;

  const guildMates = target.guildName
    ? members.filter((member) => member.guildName === target.guildName)
    : [target];

  function computeRank(getValue: (member: (typeof members)[number]) => number) {
    const totalRank =
      [...members].sort((a, b) => getValue(b) - getValue(a)).findIndex((m) => m.id === memberId) +
      1;
    const guildRank =
      [...guildMates].sort((a, b) => getValue(b) - getValue(a)).findIndex((m) => m.id === memberId) +
      1;
    return {
      value: getValue(target),
      guildRank,
      guildCount: guildMates.length,
      totalRank,
      totalCount: members.length,
    };
  }

  return {
    total: computeRank((m) => m.attack + m.defense + m.accuracy),
    attack: computeRank((m) => m.attack),
    defense: computeRank((m) => m.defense),
    accuracy: computeRank((m) => m.accuracy),
  };
}

// 인원 상세 페이지의 스탯 추이 그래프용 — 오래된 것부터 최근 순으로 반환한다.
export async function getMemberStatHistory(memberId: number) {
  return db
    .select()
    .from(memberStatHistory)
    .where(eq(memberStatHistory.memberId, memberId))
    .orderBy(asc(memberStatHistory.recordedAt));
}

// 내 통장의 "예상 정산 계산기" 카드용 — 내판 정산의 전투력 보상 몫 계산에 쓰이는
// 내 전투력(공+방+명중) / 전체 길드원 전투력 합계. settleLootSale과 동일한 정의.
export async function getMemberPowerShare(
  memberId: number
): Promise<{ myPower: number; totalPower: number }> {
  const members = await db.select().from(guildMembers);
  const totalPower = members.reduce((sum, m) => sum + m.attack + m.defense + m.accuracy, 0);
  const me = members.find((m) => m.id === memberId);
  return {
    myPower: me ? me.attack + me.defense + me.accuracy : 0,
    totalPower,
  };
}
