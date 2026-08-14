"use server";

import { and, desc, eq, isNull } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  bankTransactions,
  guildMembers,
  guildTreasuryTransactions,
  loots,
  NOW_UTC_TEXT,
} from "@/lib/db/schema";
import { requireAdmin } from "@/lib/auth/adminSession";
import { isAuctionEnded } from "@/lib/constants/loot/loots";
import { getTreasurySettings } from "@/lib/actions/treasury/treasurySettings";
import { getMemberContributionPoints } from "@/lib/actions/schedule/scheduleCheckins";

export async function getGuildTreasuryBalance(): Promise<number> {
  const rows = await db.select().from(guildTreasuryTransactions);
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

export async function getGuildTreasuryTransactions() {
  return db
    .select()
    .from(guildTreasuryTransactions)
    .orderBy(desc(guildTreasuryTransactions.createdAt));
}

// "내가 받을 수 있는 정산 몫" 계산기의 기준 금액 — 지금까지 실제로 참여+전투력
// 보상으로 개인 통장에 지급된 누적 합계(=세금/혈비/총무비를 이미 뺀 64% 몫의
// 총합). 길드 통장의 "총 수입"(혈비+총무비 적립분, 참여/전투력 몫과는 무관한
// 별개의 돈)과 혼동하지 않도록 반드시 이 값을 써야 한다.
export async function getTotalDistributedRewardPool(): Promise<number> {
  const rows = await db
    .select()
    .from(bankTransactions)
    .where(eq(bankTransactions.type, "loot_distribution"));
  return rows.reduce((sum, row) => sum + row.amount, 0);
}

// 내판(경매)이 끝났지만 아직 정산(길드 통장 분배) 처리되지 않은 건.
export async function getUnsettledAuctionLoots() {
  const rows = await db
    .select()
    .from(loots)
    .where(and(eq(loots.distributionMethod, "auction"), isNull(loots.settledAt)));
  return rows.filter((loot) => isAuctionEnded(loot) && loot.askingPrice != null);
}

// 길드 통장에 기타 수입/지출을 직접 기록한다(내판 정산·정산 분배처럼 자동으로
// 쌓이는 거래가 아니라, 운영진이 손으로 입력하는 건). 같은 폼에서 type
// 라디오(수입/지출)로 하나를 고르고, 여기서 부호만 뒤집어 저장한다.
export async function recordGuildTransaction(formData: FormData) {
  await requireAdmin();
  const isIncome = String(formData.get("type") ?? "expense") === "income";
  const amount = Math.abs(Number(formData.get("amount") ?? 0));
  const date = String(formData.get("date") ?? "").trim() || null;
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const note = String(formData.get("note") ?? "").trim() || null;

  await db.insert(guildTreasuryTransactions).values({
    type: isIncome ? "income" : "expense",
    amount: isIncome ? amount : -amount,
    date,
    reason,
    note,
  });

  revalidatePath("/admin/bank");
}

// 내판(장비 판매/외판) + 기타 외부 수입 완료 건 하나를 정산해 길드 통장(혈비/
// 총무비/잔여금)과 개인 통장(참여 + 전투력 보상)에 나눠 지급한다.
//
// 세금 9% 제외 후 순수익을 혈비 30% / 총무비 6% / 참여보상 32% / 전투력보상
// 32%로 나눈다. 참여보상은 이번 2주 구간의 전체 보스 참여도(콘텐츠 종류 상관없이
// 2/3/4성 보스·어비스보스·전투 참여 점수 합산)를 기준으로, 전투력 보상은 전체
// 길드원 전투력(공+방+명중) 비율로 나눈다. 고대성채/쟁탈전 자체 보상은 이 흐름과
// 별개로 confirmContentReward()에서 처리한다. 각 몫은 정수로 내림하고, 내림으로
// 남는 소수점 크리스탈은 모두 합쳐 길드 통장에 잔여금으로 적립해 다음 정산 때
// 자연스럽게 반영되게 한다(크리스탈이 사라지지 않도록).
export async function settleLootSale(lootId: number) {
  await requireAdmin();

  const [loot] = await db.select().from(loots).where(eq(loots.id, lootId));
  if (!loot || loot.settledAt || loot.askingPrice == null) return;

  const settings = await getTreasurySettings();
  const netAfterTax = loot.askingPrice * (1 - settings.saleTaxRate / 100);
  const reserveAmount = Math.floor(netAfterTax * (settings.reserveRatio / 100));
  const adminFeeAmount = Math.floor(netAfterTax * (settings.adminFeeRatio / 100));
  const participationPool = netAfterTax * (settings.participationRewardRatio / 100);
  const powerPool = netAfterTax * (settings.powerRewardRatio / 100);

  const [members, pointsByMember] = await Promise.all([
    db.select().from(guildMembers),
    getMemberContributionPoints(),
  ]);

  const totalPoints = [...pointsByMember.values()].reduce((sum, points) => sum + points, 0);
  const totalPower = members.reduce((sum, m) => sum + m.attack + m.defense + m.accuracy, 0);

  const payouts: {
    memberId: number;
    amount: number;
    participationShare: number;
    powerShare: number;
  }[] = [];
  let distributedToMembers = 0;

  for (const member of members) {
    const points = pointsByMember.get(member.id) ?? 0;
    const power = member.attack + member.defense + member.accuracy;
    const participationShare =
      totalPoints > 0 ? Math.floor(participationPool * (points / totalPoints)) : 0;
    const powerShare = totalPower > 0 ? Math.floor(powerPool * (power / totalPower)) : 0;
    const amount = participationShare + powerShare;
    if (amount > 0) {
      payouts.push({ memberId: member.id, amount, participationShare, powerShare });
      distributedToMembers += amount;
    }
  }

  // 세금 9%는 게임 내에서 그대로 소멸하는 몫이라 길드 통장으로 들어오지 않는다.
  // 잔여금은 세후 순수익(netAfterTax) 기준으로 계산해야 세금분이 "잔여금"으로
  // 잘못 되돌아오지 않는다.
  const remainder = Math.round(netAfterTax) - reserveAmount - adminFeeAmount - distributedToMembers;

  // Postgres(postgres-js) 트랜잭션은 async 콜백을 지원한다 — 이전 SQLite/
  // better-sqlite3는 동기 콜백만 됐어서 이 부분이 달랐다(2026-08-15 이관).
  await db.transaction(async (tx) => {
    for (const payout of payouts) {
      await tx.insert(bankTransactions).values({
        memberId: payout.memberId,
        type: "loot_distribution",
        amount: payout.amount,
        memo: `내판 정산 - ${loot.itemName} (참여 ${payout.participationShare} + 전투력 ${payout.powerShare})`,
        lootId: loot.id,
      });
    }

    await tx.insert(guildTreasuryTransactions).values({
      type: "sale_reserve",
      amount: reserveAmount,
      reason: loot.itemName,
      lootId: loot.id,
    });
    await tx.insert(guildTreasuryTransactions).values({
      type: "sale_reserve",
      amount: adminFeeAmount,
      reason: loot.itemName,
      lootId: loot.id,
    });
    if (remainder > 0) {
      await tx.insert(guildTreasuryTransactions).values({
        type: "distribution_remainder",
        amount: remainder,
        reason: loot.itemName,
        lootId: loot.id,
      });
    }

    await tx.update(loots).set({ settledAt: NOW_UTC_TEXT }).where(eq(loots.id, loot.id));
  });

  revalidatePath("/admin/bank");
  revalidatePath("/admin/loots");
  revalidatePath("/bank");
}
