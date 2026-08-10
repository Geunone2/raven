import { bossTiers, contentTypes, scheduleStatuses, targetAudiences } from "@/lib/db/schema";
import type { Tone } from "@/components/atoms/Badge";
import { todayDateString } from "@/lib/time";

export const contentTypeLabels: Record<(typeof contentTypes)[number], string> = {
  guild_dungeon: "길드 던전",
  abyss: "어비스",
  field_boss: "필드 보스",
  rift: "균열",
  ancient_fortress: "고대 성채",
  other: "기타 이벤트",
};

export const contentTypeTone: Record<(typeof contentTypes)[number], Tone> = {
  guild_dungeon: "contentGuildDungeon",
  abyss: "contentAbyss",
  field_boss: "contentFieldBoss",
  rift: "contentRift",
  ancient_fortress: "contentAncientFortress",
  other: "contentOther",
};

export const scheduleStatusLabels: Record<
  (typeof scheduleStatuses)[number],
  string
> = {
  scheduled: "예정",
  completed: "진행 완료",
  failed: "실패",
  postponed: "연기",
};

export const scheduleStatusTone: Record<(typeof scheduleStatuses)[number], Tone> = {
  scheduled: "neutral",
  completed: "success",
  failed: "danger",
  postponed: "warning",
};

export const targetAudienceLabels: Record<
  (typeof targetAudiences)[number],
  string
> = {
  all: "전체",
  top_power: "상위 전력",
  specific_party: "특정 파티",
};

export const SERVERS = ["메투스", "돌로르"];

export const bossTierLabels: Record<(typeof bossTiers)[number], string> = {
  none: "없음",
  star2: "2성 보스",
  star3: "3성 보스",
  star4: "4성 보스",
  abyss_boss: "어비스 보스",
};

// 어비스 보스는 등급을 별 개수로 표시하지 않는다 (출석 점수 안내 카드와 동일한 규칙).
export const bossTierStars: Record<(typeof bossTiers)[number], number> = {
  none: 0,
  star2: 2,
  star3: 3,
  star4: 4,
  abyss_boss: 0,
};

// 출석 점수 안내 카드(AttendanceScoreGuideCard)와 동일한 배점표.
export const bossTierPoints: Record<(typeof bossTiers)[number], number> = {
  none: 0,
  star2: 1,
  star3: 3,
  star4: 3,
  abyss_boss: 6,
};

export const COMBAT_POINTS_PER_HOUR = 3;

export function getScheduleBasePoints(schedule: {
  bossTier: (typeof bossTiers)[number];
  hasCombat: boolean;
  combatHours: number | null;
}): { bossPoints: number; combatPoints: number; total: number } {
  const bossPoints = bossTierPoints[schedule.bossTier];
  const combatPoints = schedule.hasCombat
    ? Math.round((schedule.combatHours ?? 0) * COMBAT_POINTS_PER_HOUR * 10) / 10
    : 0;
  return { bossPoints, combatPoints, total: bossPoints + combatPoints };
}

// 중간합류 시 기본 점수의 절반만 부여, 출석 취소/미응답 시 0점.
export function getCheckinPoints(
  basePoints: number,
  status: "checked_in" | "mid_join" | "cancelled" | null
): number {
  if (status === "checked_in") return basePoints;
  if (status === "mid_join") return Math.round((basePoints / 2) * 10) / 10;
  return 0;
}

// "실패"/"연기"는 관리자가 직접 판단해서 남기는 결과라 자동으로 바꿀 수 없지만,
// "예정" 상태로 방치된 지난 일정은 진행 완료로 간주해 보여준다 (DB 값 자체는 건드리지 않음).
export function getEffectiveScheduleStatus(schedule: {
  status: (typeof scheduleStatuses)[number];
  date: string;
}): (typeof scheduleStatuses)[number] {
  if (schedule.status === "scheduled" && schedule.date < todayDateString()) {
    return "completed";
  }
  return schedule.status;
}

export type ScheduleCheckinResult = { ok: boolean; message: string } | null;

const CHECKIN_GRACE_MS = 6 * 60 * 60 * 1000;

// schedule.date + schedule.startTime는 로컬 시각(시간대 마커 없음)이라, UTC로 강제
// 변환하는 toEpochMs() 대신 datetime-local 값과 동일하게 new Date()로 직접 파싱한다.
// 출석 체크는 일정 시작 후 6시간까지만 입력받고, 그 이후에는 응답을 막는다.
export function isScheduleCheckinClosed(schedule: { date: string; startTime: string }): boolean {
  const startMs = new Date(`${schedule.date}T${schedule.startTime}`).getTime();
  return Date.now() - startMs > CHECKIN_GRACE_MS;
}
