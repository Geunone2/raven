import {
  dungeonClearResults,
  dungeonDifficulties,
  lootDistributionStatuses,
} from "@/lib/db/schema";
import type { Tone } from "@/components/atoms/Badge";

export const difficultyLabels: Record<(typeof dungeonDifficulties)[number], string> = {
  easy: "쉬움",
  normal: "보통",
  hard: "어려움",
};

export const clearResultLabels: Record<(typeof dungeonClearResults)[number], string> = {
  success: "성공",
  failure: "실패",
  aborted: "중단",
};

export const distributionStatusLabels: Record<
  (typeof lootDistributionStatuses)[number],
  string
> = {
  undistributed: "미분배",
  distributing: "분배 중",
  completed: "완료",
};

// LootTable.tsx에 로컬로 중복 정의돼 있던 톤 맵을 이쪽으로 옮겼다(2026-08-15).
export const distributionStatusTone: Record<(typeof lootDistributionStatuses)[number], Tone> = {
  undistributed: "warning",
  distributing: "neutral",
  completed: "success",
};
