import { participationStatuses, ticketStatuses } from "@/lib/db/schema";
import type { Tone } from "@/components/atoms/Badge";

export const participationStatusLabels: Record<(typeof participationStatuses)[number], string> = {
  attend: "참석",
  mid_join: "중간합류",
  absent: "미참석",
};

export const participationStatusTone: Record<(typeof participationStatuses)[number], Tone> = {
  attend: "success",
  mid_join: "info",
  absent: "danger",
};

export const ticketStatusLabels: Record<(typeof ticketStatuses)[number], string> = {
  owned: "보유",
  insufficient: "부족",
  needs_check: "확인 필요",
};
