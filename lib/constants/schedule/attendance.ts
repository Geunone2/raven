import { attendanceStatuses } from "@/lib/db/schema";

export const attendanceStatusLabels: Record<(typeof attendanceStatuses)[number], string> = {
  checked_in: "출석",
  mid_join: "중간합류",
  cancelled: "출석취소",
};
