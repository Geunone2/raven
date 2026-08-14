import {
  GuildMember,
  Loot,
  LootBid,
  distributionMethods,
  lootCategories,
  lootGrades,
} from "@/lib/db/schema";
import type { Tone } from "@/components/atoms/Badge";

export type BidResult = { ok: boolean; message: string } | null;

export const lootGradeLabels: Record<(typeof lootGrades)[number], string> = {
  rare: "희귀",
  hero: "영웅",
  legendary: "전설",
};

export const lootGradeTone: Record<(typeof lootGrades)[number], Tone> = {
  rare: "rare",
  hero: "hero",
  legendary: "legendary",
};

export const distributionMethodLabels: Record<
  (typeof distributionMethods)[number],
  string
> = {
  auction: "경매제",
  officer_assigned: "운영진 지정",
  random: "랜덤 추첨",
};

export const lootCategoryLabels: Record<(typeof lootCategories)[number], string> = {
  weapon: "무기",
  armor: "방어구",
  accessory: "장신구",
  heavenstone: "헤븐스톤",
  skillbook: "스킬북",
  other: "컬렉템",
};

export const lootCategoryTone: Record<(typeof lootCategories)[number], Tone> = {
  weapon: "weapon",
  armor: "armor",
  accessory: "accessory",
  heavenstone: "heavenstone",
  skillbook: "skillbook",
  other: "other",
};

// 낙찰 처리됐거나 입찰 마감 시각이 지났으면 더 이상 입찰을 받지 않는다.
export function isAuctionEnded(loot: Loot): boolean {
  if (loot.status === "completed") return true;
  if (loot.bidDeadline && new Date(loot.bidDeadline).getTime() <= Date.now()) return true;
  return false;
}

const DEADLINE_IMMINENT_MS = 60 * 60 * 1000;

// 아직 안 끝났지만 마감까지 1시간이 채 안 남은 경우 — 카드에 임박 강조를 준다.
export function isBidDeadlineImminent(loot: Loot): boolean {
  if (!loot.bidDeadline || isAuctionEnded(loot)) return false;
  const remainingMs = new Date(loot.bidDeadline).getTime() - Date.now();
  return remainingMs <= DEADLINE_IMMINENT_MS;
}

// "입찰 유력" — 입찰가가 아니라 전투력(공+방+명중 총합)이 가장 높은 입찰자를 우선한다.
export function getLeadingBidder(
  bids: { bid: LootBid; member: GuildMember }[]
): GuildMember | null {
  if (bids.length === 0) return null;
  return bids.reduce((leader, { member }) => {
    const power = member.attack + member.defense + member.accuracy;
    const leaderPower = leader.attack + leader.defense + leader.accuracy;
    return power > leaderPower ? member : leader;
  }, bids[0].member);
}

export type AuctionWinner = { nickname: string; isManual: boolean };

// 마감된 경매의 낙찰자. 관리자가 최종 수령자(receiver)를 직접 지정했다면 그 값을
// 우선하고(운영진 확정/정정), 지정하지 않았다면 입찰 유력자(전투력 최고자)를
// 그대로 낙찰자로 자동 확정한다.
export function getAuctionWinner(
  loot: Loot,
  bids: { bid: LootBid; member: GuildMember }[]
): AuctionWinner | null {
  if (loot.receiver) return { nickname: loot.receiver, isManual: true };
  if (!isAuctionEnded(loot)) return null;
  const leading = getLeadingBidder(bids);
  return leading ? { nickname: leading.nickname, isManual: false } : null;
}
