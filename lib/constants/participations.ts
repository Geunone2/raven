import { actualStatuses, plannedStatuses, ticketStatuses } from "@/lib/db/schema";

export const plannedStatusLabels: Record<(typeof plannedStatuses)[number], string> = {
  attend: "참석",
  absent: "불참",
  undecided: "미정",
};

export const actualStatusLabels: Record<(typeof actualStatuses)[number], string> = {
  present: "실제 참석",
  late: "지각",
  absent: "불참",
  no_show: "무단 불참",
};

export const ticketStatusLabels: Record<(typeof ticketStatuses)[number], string> = {
  owned: "보유",
  insufficient: "부족",
  needs_check: "확인 필요",
};
