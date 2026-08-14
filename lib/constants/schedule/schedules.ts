import { bossTiers, contentTypes, SCHEDULE_TARGET_GUILDS } from "@/lib/db/schema";
import type { Tone } from "@/components/atoms/Badge";
import { dayjs, KST } from "@/lib/time";

export const contentTypeLabels: Record<(typeof contentTypes)[number], string> = {
  guild_dungeon: "길드 던전",
  abyss: "어비스",
  field_boss: "필드 보스",
  ancient_fortress: "고대 성채",
  siege: "쟁탈전",
  abyss_battle: "어비스 전투",
  other: "기타 이벤트",
};

export const contentTypeTone: Record<(typeof contentTypes)[number], Tone> = {
  guild_dungeon: "contentGuildDungeon",
  abyss: "contentAbyss",
  field_boss: "contentFieldBoss",
  ancient_fortress: "contentAncientFortress",
  siege: "contentSiege",
  abyss_battle: "contentAbyssBattle",
  other: "contentOther",
};

// 참여 길드(전체/리더1/리더2/리더4) 값 자체가 이미 표시용 한글 문자열이라 별도
// 라벨 맵이 필요 없다 — schema.ts의 SCHEDULE_TARGET_GUILDS를 그대로 재노출.
export { SCHEDULE_TARGET_GUILDS };

// 쟁탈전/고대성채는 "기여도 점수" 시스템에 들어가지 않는다(2026-08-14) — 출석
// 체크는 참석 여부(출석/중간합류/취소)만 기록하는 명단일 뿐이고, 보상은 이
// 점수와 무관하게 별도의 다이아 정산(confirmContentReward, /admin/loots)으로
// 직접 지급된다. 출석 체크 UI의 점수 표시와 "내 기여도" 2주 합산
// (getMemberContributionPoints)에서 이 콘텐츠 종류를 제외하는 데 쓴다.
export const NON_CONTRIBUTION_CONTENT_TYPES = ["siege", "ancient_fortress"] as const;

// 콘텐츠 일정(content_schedules.server_name)과 길드원(guild_members.server) 양쪽에서
// 공유하는 서버 목록. 이 둘은 서로 무관한 독립 필드다 — 같은 값 집합을 쓸 뿐이다.
export const SERVERS = ["메투스", "살루스", "돌로르", "호노르", "피데스", "모르스"];

// 관리자 일정표(/admin/schedules)의 기간 필터. "오늘"이 기본값이고, "하루 전"부터는
// 값이 커질수록 더 과거까지 넓혀서 보여준다(상한은 오늘까지 — 미래 일정은 "내일"과
// "전체"에서만 보인다). 오늘 ⊂ 하루 전 ⊂ 일주일 전까지 ⊂ 한달 전까지 ⊂ 전체 순으로
// 포함 관계가 커진다. "내일"은 lookback이 아니라 날짜가 정확히 내일인 것만 보는
// 별도 분기다(2026-08-14 추가).
export const SCHEDULE_PERIODS = ["today", "tomorrow", "day", "week", "month", "all"] as const;
export type SchedulePeriod = (typeof SCHEDULE_PERIODS)[number];

export const SCHEDULE_PERIOD_LABELS: Record<SchedulePeriod, string> = {
  today: "오늘 일정",
  tomorrow: "내일 일정",
  day: "하루 전 일정",
  week: "일주일 전까지 일정",
  month: "한달 전까지 일정",
  all: "전체 일정",
};

// getSchedules()가 period로부터 조회 하한(오늘 기준 며칠 전부터)을 계산할 때 쓴다.
// "all"과 "tomorrow"는 별도 분기로 처리되므로 여기 없다.
export const SCHEDULE_PERIOD_LOOKBACK_DAYS: Record<
  Exclude<SchedulePeriod, "all" | "tomorrow">,
  number
> = {
  today: 0,
  day: 1,
  week: 7,
  month: 30,
};

export const bossTierLabels: Record<(typeof bossTiers)[number], string> = {
  none: "없음",
  star3: "3성 보스",
  star4: "4성 보스",
  star5: "5성 보스",
  abyss_boss: "어비스 보스",
};

// 어비스 보스는 등급을 별 개수로 표시하지 않는다 (출석 점수 안내 카드와 동일한 규칙).
export const bossTierStars: Record<(typeof bossTiers)[number], number> = {
  none: 0,
  star3: 3,
  star4: 4,
  star5: 5,
  abyss_boss: 0,
};

// 출석 점수 안내 카드(AttendanceScoreGuideCard)와 동일한 배점표(2026-08-14 확정).
// 일정별로 content_schedules.bossPoints가 입력되어 있으면 이 표 대신 그 값을 쓴다.
export const bossTierPoints: Record<(typeof bossTiers)[number], number> = {
  none: 0,
  star3: 3,
  star4: 6,
  star5: 6,
  abyss_boss: 6,
};

export const COMBAT_POINTS_PER_HOUR = 3;

// "어비스 띵" — 보스 등급/전투 시간과 무관하게 운영진이 별도로 켜는 고정 보너스.
export const ABYSS_DING_POINTS = 6;

export function getScheduleBasePoints(schedule: {
  bossTier: (typeof bossTiers)[number];
  bossPoints?: number | null;
  hasCombat: boolean;
  combatHours: number | null;
  hasAbyssDing?: boolean;
}): { bossPoints: number; combatPoints: number; abyssDingPoints: number; total: number } {
  const bossPoints = schedule.bossPoints ?? bossTierPoints[schedule.bossTier];
  const combatPoints = schedule.hasCombat
    ? Math.round((schedule.combatHours ?? 0) * COMBAT_POINTS_PER_HOUR * 10) / 10
    : 0;
  const abyssDingPoints = schedule.hasAbyssDing ? ABYSS_DING_POINTS : 0;
  return {
    bossPoints,
    combatPoints,
    abyssDingPoints,
    total: bossPoints + combatPoints + abyssDingPoints,
  };
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

// 관리자 참여 체크(participations)용 — getCheckinPoints와 규칙은 동일(중간합류
// 절반, 그 외 0점)하지만 participations의 status enum(attend/mid_join/absent)을
// 그대로 받는다.
export function getParticipationPoints(
  basePoints: number,
  status: "attend" | "mid_join" | "absent" | null | undefined
): number {
  if (status === "attend") return basePoints;
  if (status === "mid_join") return Math.round((basePoints / 2) * 10) / 10;
  return 0;
}

export type ScheduleCheckinResult = { ok: boolean; message: string } | null;

const CHECKIN_GRACE_MS = 6 * 60 * 60 * 1000;

// schedule.date + schedule.startTime는 운영진이 입력한 KST 벽시계 시각이다 —
// new Date(`${date}T${startTime}`)로 그냥 파싱하면 서버 런타임의 시간대(Vercel은
// UTC)로 잘못 해석돼, 출석 체크 시작/마감 판정이 최대 9시간 어긋나는 버그가
// 있었다(2026-08-15 수정). dayjs.tz로 KST를 명시해서 서버가 어느 시간대에서
// 돌든 항상 같은 결과가 나오게 한다.
// 출석 체크 버튼은 일정 시작 전에는 아직 나타나지 않는다(2026-08-14).
export function isScheduleCheckinNotStarted(schedule: { date: string; startTime: string }): boolean {
  const startMs = dayjs.tz(`${schedule.date}T${schedule.startTime}`, KST).valueOf();
  return Date.now() < startMs;
}

// 출석 체크는 일정 시작 후 6시간까지만 입력받고, 그 이후에는 응답을 막는다.
export function isScheduleCheckinClosed(schedule: { date: string; startTime: string }): boolean {
  const startMs = dayjs.tz(`${schedule.date}T${schedule.startTime}`, KST).valueOf();
  return Date.now() - startMs > CHECKIN_GRACE_MS;
}
