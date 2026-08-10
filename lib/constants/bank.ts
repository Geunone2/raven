import { bankTransactionTypes } from "@/lib/db/schema";

export const bankTransactionTypeLabels: Record<(typeof bankTransactionTypes)[number], string> = {
  deposit: "입금",
  withdrawal: "출금",
  adjustment: "조정",
  loot_distribution: "전리품 분배금",
  auction_payment: "경매 낙찰 차감",
  content_reward: "콘텐츠 보상금",
};

// Manual admin entries only — loot_distribution/auction_payment are reserved
// for future programmatic inserts (분배금 자동계산, 경매 자동차감).
export const manualBankTransactionTypes = ["deposit", "withdrawal", "adjustment"] as const;
