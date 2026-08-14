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
  income: "기타 수입",
};

export const guildTreasuryTransactionTypeTone: Record<
  (typeof guildTreasuryTransactionTypes)[number],
  Tone
> = {
  initial_balance: "info",
  sale_reserve: "success",
  distribution_remainder: "neutral",
  expense: "danger",
  income: "success",
};

// 정산 비율(세금/혈비/총무비/참여보상/전투력보상)은 더 이상 여기 고정값이 아니라
// treasury_settings 테이블에서 관리한다(2026-08-14, /admin/settings에서 수정
// 가능) — lib/actions/treasurySettings.ts의 getTreasurySettings() 참고.
// 각 값의 기본값은 스키마(lib/db/schema.ts의 treasurySettings)에 정의돼 있다.
