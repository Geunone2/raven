import {
  dungeonClearResults,
  dungeonDifficulties,
  lootDistributionStatuses,
} from "@/lib/db/schema";

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
