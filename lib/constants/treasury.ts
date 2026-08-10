import { guildTreasuryTransactionTypes } from "@/lib/db/schema";
import type { Tone } from "@/components/atoms/Badge";

export const guildTreasuryTransactionTypeLabels: Record<
  (typeof guildTreasuryTransactionTypes)[number],
  string
> = {
  initial_balance: "초기 보유금",
  sale_reserve: "내판 정산 적립",
  distribution_remainder: "분배 잔여금",
  expense: "지출",
};

export const guildTreasuryTransactionTypeTone: Record<
  (typeof guildTreasuryTransactionTypes)[number],
  Tone
> = {
  initial_balance: "info",
  sale_reserve: "success",
  distribution_remainder: "neutral",
  expense: "danger",
};

// 내판 정산 비율 — 세금 제외 후 순수익(net) 기준.
export const SALE_TAX_RATE = 0.09; // 게임 기본 세금
export const RESERVE_RATIO = 0.3; // 혈비
export const ADMIN_FEE_RATIO = 0.06; // 총무비
export const PARTICIPATION_REWARD_RATIO = 0.32; // 참여 보상
export const POWER_REWARD_RATIO = 0.32; // 전투력 보상

// "내가 받을 수 있는 정산 몫" 계산기용 — 참여/전투력 보상은 원래 판매금액 기준
// 각 32%(합 64%)지만, 계산기는 이미 세금/혈비/총무비가 빠진 "누적 지급 보상
// 합계"(64% 몫만 모인 금액, getTotalDistributedRewardPool)를 기준으로 삼는다.
// 64%의 절반씩(50:50)이 정확히 원래의 32%:32% 비율과 같으므로 정책은 동일하다.
export const PARTICIPATION_SHARE_OF_REWARD_POOL = 0.5;
export const POWER_SHARE_OF_REWARD_POOL = 0.5;
