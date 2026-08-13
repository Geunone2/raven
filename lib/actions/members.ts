"use server";

import { and, asc, desc, eq, like, sql } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import { characterTypes, guildMemberRoles, guildMembers, memberStatHistory } from "@/lib/db/schema";
import type { RankStat, UpdateStatsResult } from "@/lib/constants/members";
import { getSessionMemberId } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/adminSession";

export type MemberFilters = {
  q?: string;
  role?: string;
};

export async function getMembers(filters: MemberFilters = {}) {
  const conditions = [];
  if (filters.q) {
    conditions.push(like(guildMembers.nickname, `%${filters.q}%`));
  }
  if (filters.role && (guildMemberRoles as readonly string[]).includes(filters.role)) {
    conditions.push(eq(guildMembers.role, filters.role as (typeof guildMemberRoles)[number]));
  }

  return db
    .select()
    .from(guildMembers)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(guildMembers.createdAt));
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
  return {
    nickname: String(formData.get("nickname") ?? "").trim(),
    guildName: String(formData.get("guildName") ?? "").trim() || null,
    server: String(formData.get("server") ?? "").trim() || null,
    className: String(formData.get("className") ?? "").trim(),
    level: Number(formData.get("level") ?? 0),
    attack: Number(formData.get("attack") ?? 0),
    defense: Number(formData.get("defense") ?? 0),
    accuracy: Number(formData.get("accuracy") ?? 0),
    role: String(formData.get("role") ?? "member") as (typeof guildMemberRoles)[number],
    lastLoginAt: String(formData.get("lastLoginAt") ?? "") || null,
    memo: String(formData.get("memo") ?? "") || null,
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
