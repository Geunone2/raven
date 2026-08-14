"use server";

import { and, desc, eq, ne } from "drizzle-orm";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db/client";
import {
  distributionMethods,
  guildMembers,
  lootBids,
  lootCategories,
  lootDistributionStatuses,
  lootGrades,
  loots,
} from "@/lib/db/schema";
import { getSessionMemberId } from "@/lib/auth/session";
import { requireAdmin } from "@/lib/auth/adminSession";
import { isAuctionEnded, type BidResult } from "@/lib/constants/loots";

export async function getLoots(filters: { status?: string } = {}) {
  const conditions = [];
  if (
    filters.status &&
    (lootDistributionStatuses as readonly string[]).includes(filters.status)
  ) {
    conditions.push(
      eq(loots.status, filters.status as (typeof lootDistributionStatuses)[number])
    );
  }

  return db
    .select({ loot: loots })
    .from(loots)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(loots.obtainedAt));
}

export async function countPendingLoots() {
  const rows = await db
    .select()
    .from(loots)
    .where(eq(loots.status, "undistributed"));
  return rows.length;
}

export async function getLoot(id: number) {
  const [loot] = await db.select().from(loots).where(eq(loots.id, id));
  return loot;
}

function parseLootForm(formData: FormData) {
  return {
    itemName: String(formData.get("itemName") ?? "").trim(),
    grade: String(formData.get("grade") ?? "rare") as (typeof lootGrades)[number],
    category: String(formData.get("category") ?? "other") as (typeof lootCategories)[number],
    obtainedAt: String(formData.get("obtainedAt") ?? ""),
    distributionMethod: String(
      formData.get("distributionMethod") ?? "officer_assigned"
    ) as (typeof distributionMethods)[number],
    askingPrice: formData.get("askingPrice")
      ? Number(formData.get("askingPrice"))
      : null,
    custodyGuild: String(formData.get("custodyGuild") ?? "").trim() || null,
    bidDeadline: String(formData.get("bidDeadline") ?? "") || null,
    receiver: String(formData.get("receiver") ?? "") || null,
    status: String(
      formData.get("status") ?? "undistributed"
    ) as (typeof lootDistributionStatuses)[number],
    note: String(formData.get("note") ?? "") || null,
  };
}

export async function createLoot(formData: FormData) {
  await requireAdmin();
  const values = parseLootForm(formData);
  await db.insert(loots).values(values);
  revalidatePath("/admin/loots");
  revalidatePath("/auctions");
  redirect("/admin/loots");
}

export async function updateLoot(id: number, formData: FormData) {
  await requireAdmin();
  const values = parseLootForm(formData);
  await db.update(loots).set(values).where(eq(loots.id, id));
  revalidatePath("/admin/loots");
  revalidatePath("/auctions");
  redirect("/admin/loots");
}

export async function deleteLoot(id: number) {
  await requireAdmin();
  await db.delete(loots).where(eq(loots.id, id));
  revalidatePath("/admin/loots");
  revalidatePath("/auctions");
  redirect("/admin/loots");
}

export async function getOpenAuctionLoots() {
  return db
    .select({ loot: loots })
    .from(loots)
    .where(and(eq(loots.distributionMethod, "auction"), ne(loots.status, "completed")))
    .orderBy(desc(loots.obtainedAt));
}

// /auctions 목록 페이지용 — 진행중/종료 필터를 화면에서 처리할 수 있도록 상태와
// 무관하게 경매제 전리품 전체를 가져온다.
export async function getAuctionLoots() {
  return db
    .select({ loot: loots })
    .from(loots)
    .where(eq(loots.distributionMethod, "auction"))
    .orderBy(desc(loots.obtainedAt));
}

export async function getMyBidAmounts(memberId: number, lootIds: number[]) {
  if (lootIds.length === 0) return new Map<number, number>();
  const rows = await db
    .select()
    .from(lootBids)
    .where(eq(lootBids.memberId, memberId));
  return new Map(
    rows.filter((row) => lootIds.includes(row.lootId)).map((row) => [row.lootId, row.amount])
  );
}

export async function getBidsForLoot(lootId: number) {
  return db
    .select({ bid: lootBids, member: guildMembers })
    .from(lootBids)
    .innerJoin(guildMembers, eq(lootBids.memberId, guildMembers.id))
    .where(eq(lootBids.lootId, lootId))
    .orderBy(desc(lootBids.amount));
}

export async function placeBid(
  lootId: number,
  _prevState: BidResult,
  _formData: FormData
): Promise<BidResult> {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const [loot] = await db.select().from(loots).where(eq(loots.id, lootId));
  if (!loot || isAuctionEnded(loot)) {
    return { ok: false, message: "입찰 중 문제가 발생했습니다." };
  }

  // 판매 금액이 고정돼 있어 입찰가를 따로 받지 않는다 — 참여 = 판매 금액으로 입찰.
  const amount = loot.askingPrice ?? 0;

  await db
    .insert(lootBids)
    .values({ lootId, memberId, amount })
    .onConflictDoUpdate({
      target: [lootBids.lootId, lootBids.memberId],
      set: { amount },
    });

  revalidatePath("/auctions");
  return { ok: true, message: "입찰되었습니다." };
}

export async function cancelBid(
  lootId: number,
  _prevState: BidResult,
  _formData: FormData
): Promise<BidResult> {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const [loot] = await db.select().from(loots).where(eq(loots.id, lootId));
  if (!loot || isAuctionEnded(loot)) {
    return { ok: false, message: "입찰 중 문제가 발생했습니다." };
  }

  await db
    .delete(lootBids)
    .where(and(eq(lootBids.lootId, lootId), eq(lootBids.memberId, memberId)));

  revalidatePath("/auctions");
  return { ok: true, message: "입찰 취소되었습니다." };
}

export async function awardAuction(lootId: number, memberId: number) {
  await requireAdmin();
  const [member] = await db
    .select()
    .from(guildMembers)
    .where(eq(guildMembers.id, memberId));

  if (!member) return;

  await db
    .update(loots)
    .set({ receiver: member.nickname, status: "completed" })
    .where(eq(loots.id, lootId));

  revalidatePath("/admin/loots");
  revalidatePath(`/admin/loots/${lootId}`);
  revalidatePath("/auctions");
}
