"use server";

import { and, eq, inArray, isNull, lte } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  bankTransactions,
  ContentSchedule,
  contentSchedules,
  GuildMember,
  guildMembers,
  guildTreasuryTransactions,
  NOW_UTC_TEXT,
  scheduleCheckins,
  TreasurySettings,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";
import { getTreasurySettings } from "@/lib/actions/treasury/treasurySettings";
import {
  getCheckinPoints,
  getScheduleBasePoints,
  NON_CONTRIBUTION_CONTENT_TYPES,
} from "@/lib/constants/schedule/schedules";
import { todayDateString } from "@/lib/time";

// 기여도 점수를 안 받는 콘텐츠 = 다이아 정산을 직접 받는 콘텐츠(같은 두 종류).
const CONTENT_REWARD_TYPES = NON_CONTRIBUTION_CONTENT_TYPES;

// 고대성채/쟁탈전은 별도의 다이아 수입원 — 지나간 일정 중 아직 보상 정산이
// 안 된 것만 노출한다(장비 내판 정산과는 완전히 별개 흐름).
export async function getUnsettledContentRewardSchedules() {
  const today = todayDateString();
  return db
    .select()
    .from(contentSchedules)
    .where(
      and(
        inArray(contentSchedules.type, CONTENT_REWARD_TYPES),
        isNull(contentSchedules.rewardSettledAt),
        lte(contentSchedules.date, today)
      )
    );
}

// "참여한 인원의 보상 분배 비율" 표를 그리는 데 쓰는 한 행. ratio는 실제
// 지급된 금액(distributedToMembers) 안에서의 비율(%)이라, 잔액이 길드 통장으로
// 넘어간 만큼 100%를 살짝 못 채울 수 있다.
export type ContentRewardBreakdownRow = {
  memberId: number;
  nickname: string;
  status: "checked_in" | "mid_join";
  bossShare: number;
  powerShare: number;
  amount: number;
  ratio: number;
};

export type ContentRewardPreviewResult = {
  ok: boolean;
  message: string;
  totalDia?: number;
  reserveAmount?: number;
  adminFeeAmount?: number;
  remainingPool?: number;
  breakdown?: ContentRewardBreakdownRow[];
  // 화면에 "혈비 30%"처럼 실제 적용된 비율을 같이 보여주기 위한 값(2026-08-14) —
  // /admin/settings에서 바뀔 수 있는 값이라 하드코딩하지 않고 그대로 실어 보낸다.
  reserveRatio?: number;
  adminFeeRatio?: number;
  participationRewardRatio?: number;
  powerRewardRatio?: number;
} | null;

export type ContentRewardConfirmResult = { ok: boolean; message: string };

// 고대성채/쟁탈전 일정 하나의 보상 다이아를 배분 계산한다(미리보기 전용 —
// DB에는 아무것도 쓰지 않는다). 장비 내판과 달리 세금은 없고, 참여 여부는
// 출석/중간합류/미참석 2택으로 걸러낸다 — 출석하지 않았으면 이 일정의 보상은
// 아예 받을 수 없다.
//
// 정산 비율(혈비/총무비/참여보상/전투력보상)은 treasury_settings에서 가져온다
// (2026-08-14, /admin/settings에서 조정 가능 — 이전엔 고정 30%/6%/50%/50%였다).
// 보스 기여도·전투력 기여도 몫은 각각 "총 다이아 × participationRewardRatio",
// "총 다이아 × powerRewardRatio"로 계산해서(장비 내판 정산 settleLootSale과
// 동일한 방식) 두 정산 흐름이 같은 정책을 공유하게 했다. 각각을 "전체 전투력에서
// 내 전투력 비율"·"전체 보스 기여도 점수에서 내 기여도 점수 비율"만큼 나눠 갖는다.
// 보스 기여도 점수는 기존 출석 점수 시스템(getScheduleBasePoints/
// getCheckinPoints)을 그대로 써서 출석=1배, 중간합류=0.5배로 계산하고, 전투력
// 비율도 전체 길드원이 아니라 "이 일정에 출석한 사람들" 안에서만 계산해야
// 미출석자가 전투력만으로 보상을 가져가는 일이 없다.
function computeContentRewardBreakdown(
  schedule: ContentSchedule,
  totalDia: number,
  attendees: { member: GuildMember; status: "checked_in" | "mid_join" }[],
  settings: TreasurySettings
) {
  const reserveAmount = Math.floor(totalDia * (settings.reserveRatio / 100));
  const adminFeeAmount = Math.floor(totalDia * (settings.adminFeeRatio / 100));
  const remainingPool = totalDia - reserveAmount - adminFeeAmount;
  const bossPool = totalDia * (settings.participationRewardRatio / 100);
  const powerPool = totalDia * (settings.powerRewardRatio / 100);

  // 이 일정 하나에 대한 기본 점수(bossTier/전투시간 기준) — 출석자 전원에게
  // 동일하게 적용되고, 상태(출석/중간합류)에 따라 getCheckinPoints가 1배/0.5배로
  // 조정한다. 이 점수는 정산 지급액이 아니라 "보스 기여도 비율"을 나누는 가중치로만 쓰인다.
  const baseScore = getScheduleBasePoints(schedule).total || 1;
  const attendeeScores = attendees.map(({ member, status }) => ({
    member,
    status,
    score: getCheckinPoints(baseScore, status),
  }));

  const totalAttendeePower = attendees.reduce(
    (sum, { member }) => sum + member.attack + member.defense + member.accuracy,
    0
  );
  const totalAttendeeScore = attendeeScores.reduce((sum, { score }) => sum + score, 0);

  const payouts: {
    memberId: number;
    nickname: string;
    status: "checked_in" | "mid_join";
    amount: number;
    bossShare: number;
    powerShare: number;
  }[] = [];
  let distributedToMembers = 0;

  for (const { member, status, score } of attendeeScores) {
    const power = member.attack + member.defense + member.accuracy;
    const bossShare =
      totalAttendeeScore > 0 ? Math.floor(bossPool * (score / totalAttendeeScore)) : 0;
    const powerShare =
      totalAttendeePower > 0 ? Math.floor(powerPool * (power / totalAttendeePower)) : 0;
    const amount = bossShare + powerShare;
    if (amount > 0) {
      payouts.push({ memberId: member.id, nickname: member.nickname, status, amount, bossShare, powerShare });
      distributedToMembers += amount;
    }
  }

  const remainder = Math.round(remainingPool) - distributedToMembers;
  const breakdown: ContentRewardBreakdownRow[] = payouts.map((payout) => ({
    ...payout,
    ratio:
      distributedToMembers > 0 ? Math.round((payout.amount / distributedToMembers) * 1000) / 10 : 0,
  }));

  return { breakdown, reserveAmount, adminFeeAmount, remainingPool, remainder, distributedToMembers };
}

async function getContentRewardAttendees(scheduleId: number) {
  const rows = await db
    .select({ member: guildMembers, status: scheduleCheckins.status })
    .from(scheduleCheckins)
    .innerJoin(guildMembers, eq(scheduleCheckins.memberId, guildMembers.id))
    .where(
      and(
        eq(scheduleCheckins.scheduleId, scheduleId),
        inArray(scheduleCheckins.status, ["checked_in", "mid_join"])
      )
    );
  return rows.map(({ member, status }) => ({
    member,
    status: status as "checked_in" | "mid_join",
  }));
}

// 1단계: 획득 다이아를 입력받아 분배 내역을 계산만 하고 보여준다. DB에는
// 아무것도 쓰지 않는다 — 최종 확인(confirmContentReward)을 눌러야 실제로 반영된다.
export async function previewContentReward(
  scheduleId: number,
  _prevState: ContentRewardPreviewResult,
  formData: FormData
): Promise<ContentRewardPreviewResult> {
  await requireAdmin();

  const [schedule] = await db
    .select()
    .from(contentSchedules)
    .where(eq(contentSchedules.id, scheduleId));
  if (
    !schedule ||
    schedule.rewardSettledAt ||
    !(CONTENT_REWARD_TYPES as readonly string[]).includes(schedule.type)
  ) {
    return { ok: false, message: "이미 정산되었거나 존재하지 않는 일정입니다." };
  }

  const totalDia = Math.max(0, Number(formData.get("totalDia") ?? 0));
  if (totalDia <= 0) {
    return { ok: false, message: "획득 다이아를 입력해주세요." };
  }

  const attendees = await getContentRewardAttendees(scheduleId);
  if (attendees.length === 0) {
    return { ok: false, message: "출석/중간합류한 인원이 없어 정산할 수 없습니다." };
  }

  const settings = await getTreasurySettings();
  const { breakdown, reserveAmount, adminFeeAmount, remainingPool } = computeContentRewardBreakdown(
    schedule,
    totalDia,
    attendees,
    settings
  );

  return {
    ok: true,
    message: "아래 내역을 확인한 뒤 최종 확인을 눌러주세요.",
    totalDia,
    reserveAmount,
    adminFeeAmount,
    remainingPool,
    breakdown,
    reserveRatio: settings.reserveRatio,
    adminFeeRatio: settings.adminFeeRatio,
    participationRewardRatio: settings.participationRewardRatio,
    powerRewardRatio: settings.powerRewardRatio,
  };
}

// 2단계: 미리보기에서 이미 계산된 내역을 그대로 받아 DB에 반영한다(다시
// 계산하지 않음 — 화면에서 확인한 값과 실제 반영값이 어긋나지 않게 하기 위함).
export async function confirmContentReward(
  scheduleId: number,
  breakdown: ContentRewardBreakdownRow[],
  totalDia: number
): Promise<ContentRewardConfirmResult> {
  await requireAdmin();

  const [schedule] = await db
    .select()
    .from(contentSchedules)
    .where(eq(contentSchedules.id, scheduleId));
  if (
    !schedule ||
    schedule.rewardSettledAt ||
    !(CONTENT_REWARD_TYPES as readonly string[]).includes(schedule.type)
  ) {
    return { ok: false, message: "이미 정산되었거나 존재하지 않는 일정입니다." };
  }
  if (!breakdown || breakdown.length === 0) {
    return { ok: false, message: "정산할 내역이 없습니다." };
  }

  const settings = await getTreasurySettings();
  const reserveAmount = Math.floor(totalDia * (settings.reserveRatio / 100));
  const adminFeeAmount = Math.floor(totalDia * (settings.adminFeeRatio / 100));
  const remainingPool = totalDia - reserveAmount - adminFeeAmount;
  const distributedToMembers = breakdown.reduce((sum, row) => sum + row.amount, 0);
  const remainder = Math.round(remainingPool) - distributedToMembers;

  // Postgres(postgres-js) 트랜잭션은 async 콜백을 지원한다 — 이전 SQLite/
  // better-sqlite3는 동기 콜백만 됐어서 이 부분이 달랐다(2026-08-15 이관).
  await db.transaction(async (tx) => {
    for (const row of breakdown) {
      await tx.insert(bankTransactions).values({
        memberId: row.memberId,
        type: "content_reward",
        amount: row.amount,
        memo: `${schedule.title} 보상 정산 (참여도 ${row.bossShare} + 전투력 ${row.powerShare})`,
      });
    }

    await tx.insert(guildTreasuryTransactions).values({
      type: "sale_reserve",
      amount: reserveAmount,
      reason: schedule.title,
    });
    await tx.insert(guildTreasuryTransactions).values({
      type: "sale_reserve",
      amount: adminFeeAmount,
      reason: schedule.title,
    });
    if (remainder > 0) {
      await tx.insert(guildTreasuryTransactions).values({
        type: "distribution_remainder",
        amount: remainder,
        reason: schedule.title,
      });
    }

    await tx
      .update(contentSchedules)
      .set({ rewardSettledAt: NOW_UTC_TEXT })
      .where(eq(contentSchedules.id, scheduleId));
  });

  revalidatePath("/admin/bank");
  revalidatePath("/bank");
  revalidatePath("/admin/loots");

  return { ok: true, message: `${schedule.title} 정산이 완료되었습니다.` };
}
