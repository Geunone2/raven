"use server";

import { and, eq, inArray, isNull, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  bankTransactions,
  contentSchedules,
  guildMembers,
  guildTreasuryTransactions,
  scheduleCheckins,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";
import { ADMIN_FEE_RATIO, RESERVE_RATIO } from "@/lib/constants/treasury";
import { getCheckinPoints, getScheduleBasePoints } from "@/lib/constants/schedules";
import { todayDateString } from "@/lib/time";

const CONTENT_REWARD_TYPES = ["ancient_fortress", "rift"] as const;

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

// 고대성채/쟁탈전 일정 하나의 보상 다이아를 정산한다. 장비 내판과 달리 세금은
// 없고, 참여 여부는 출석/중간합류/미참석 2택으로 걸러낸다 — 출석하지 않았으면
// 이 일정의 보상은 아예 받을 수 없다.
//
// 총 다이아 - 혈비(30%) - 총무비(6%) = 남은 금액. 남은 금액을 보스 기여도
// 50% + 전투력 기여도 50%로 나누고, 각각을 "전체 전투력에서 내 전투력 비율"·
// "전체 보스 기여도 점수에서 내 기여도 점수 비율"만큼 가져간다(50%는 두 기준이
// 차지하는 가중치일 뿐, 남은 금액을 반으로 잘라 그대로 나눠주는 게 아니다).
// 보스 기여도 점수는 기존 출석 점수 시스템(getScheduleBasePoints/
// getCheckinPoints)을 그대로 써서 출석=1배, 중간합류=0.5배로 계산하고, 전투력
// 비율도 전체 길드원이 아니라 "이 일정에 출석한 사람들" 안에서만 계산해야
// 미출석자가 전투력만으로 보상을 가져가는 일이 없다.
export async function settleContentReward(scheduleId: number, formData: FormData) {
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
    return;
  }

  const totalDia = Math.max(0, Number(formData.get("totalDia") ?? 0));
  if (totalDia <= 0) return;

  const reserveAmount = Math.floor(totalDia * RESERVE_RATIO);
  const adminFeeAmount = Math.floor(totalDia * ADMIN_FEE_RATIO);
  const remainingPool = totalDia - reserveAmount - adminFeeAmount;
  const bossPool = remainingPool * 0.5;
  const powerPool = remainingPool * 0.5;

  const attendees = await db
    .select({ member: guildMembers, status: scheduleCheckins.status })
    .from(scheduleCheckins)
    .innerJoin(guildMembers, eq(scheduleCheckins.memberId, guildMembers.id))
    .where(
      and(
        eq(scheduleCheckins.scheduleId, scheduleId),
        inArray(scheduleCheckins.status, ["checked_in", "mid_join"])
      )
    );

  // 이 일정 하나에 대한 기본 점수(bossTier/전투시간 기준) — 출석자 전원에게
  // 동일하게 적용되고, 상태(출석/중간합류)에 따라 getCheckinPoints가 1배/0.5배로
  // 조정한다. 이 점수는 정산 지급액이 아니라 "보스 기여도 비율"을 나누는 가중치로만 쓰인다.
  const baseScore = getScheduleBasePoints(schedule).total || 1;
  const attendeeScores = attendees.map(({ member, status }) => ({
    member,
    score: getCheckinPoints(baseScore, status),
  }));

  const totalAttendeePower = attendees.reduce(
    (sum, { member }) => sum + member.attack + member.defense + member.accuracy,
    0
  );
  const totalAttendeeScore = attendeeScores.reduce((sum, { score }) => sum + score, 0);

  const payouts: { memberId: number; amount: number; bossShare: number; powerShare: number }[] = [];
  let distributedToMembers = 0;

  for (const { member, score } of attendeeScores) {
    const power = member.attack + member.defense + member.accuracy;
    const bossShare =
      totalAttendeeScore > 0 ? Math.floor(bossPool * (score / totalAttendeeScore)) : 0;
    const powerShare =
      totalAttendeePower > 0 ? Math.floor(powerPool * (power / totalAttendeePower)) : 0;
    const amount = bossShare + powerShare;
    if (amount > 0) {
      payouts.push({ memberId: member.id, amount, bossShare, powerShare });
      distributedToMembers += amount;
    }
  }

  const remainder = Math.round(remainingPool) - distributedToMembers;

  // better-sqlite3 드라이버의 트랜잭션은 완전히 동기 콜백만 지원한다.
  db.transaction((tx) => {
    for (const payout of payouts) {
      tx.insert(bankTransactions)
        .values({
          memberId: payout.memberId,
          type: "content_reward",
          amount: payout.amount,
          memo: `${schedule.title} 보상 정산 (참여도 ${payout.bossShare} + 전투력 ${payout.powerShare})`,
        })
        .run();
    }

    tx.insert(guildTreasuryTransactions)
      .values({
        type: "sale_reserve",
        amount: reserveAmount,
        reason: schedule.title,
      })
      .run();
    tx.insert(guildTreasuryTransactions)
      .values({
        type: "sale_reserve",
        amount: adminFeeAmount,
        reason: schedule.title,
      })
      .run();
    if (remainder > 0) {
      tx.insert(guildTreasuryTransactions)
        .values({
          type: "distribution_remainder",
          amount: remainder,
          reason: schedule.title,
        })
        .run();
    }

    tx.update(contentSchedules)
      .set({ rewardSettledAt: sql`(current_timestamp)` })
      .where(eq(contentSchedules.id, scheduleId))
      .run();
  });

  revalidatePath("/admin/bank");
  revalidatePath("/bank");
}
