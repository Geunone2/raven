import { bankTransactionTypes } from "@/lib/db/schema";
import type { Tone } from "@/components/atoms/Badge";

export const bankTransactionTypeLabels: Record<(typeof bankTransactionTypes)[number], string> = {
  deposit: "입금",
  withdrawal: "출금",
  adjustment: "조정",
  loot_distribution: "전리품 분배금",
  auction_payment: "경매 낙찰 차감",
  content_reward: "콘텐츠 보상금",
};

// BankTransactionTable에 로컬로 중복 정의돼 있던 톤 맵을 treasury.ts의
// guildTreasuryTransactionTypeTone 패턴대로 이쪽으로 옮겼다(2026-08-15).
export const bankTransactionTypeTone: Record<(typeof bankTransactionTypes)[number], Tone> = {
  deposit: "success",
  withdrawal: "danger",
  adjustment: "neutral",
  loot_distribution: "success",
  auction_payment: "warning",
  content_reward: "info",
};

// Manual admin entries only — loot_distribution/auction_payment are reserved
// for future programmatic inserts (분배금 자동계산, 경매 자동차감).
export const manualBankTransactionTypes = ["deposit", "withdrawal", "adjustment"] as const;
