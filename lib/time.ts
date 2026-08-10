// SQLite's CURRENT_TIMESTAMP produces "YYYY-MM-DD HH:MM:SS" in UTC with no
// timezone marker, which most JS engines would otherwise parse as local time.
export function toEpochMs(input: Date | number | string): number {
  if (typeof input === "number") return input;
  if (typeof input === "string") return new Date(`${input.replace(" ", "T")}Z`).getTime();
  return input.getTime();
}

export function isWithinLast24Hours(input: Date | number | string): boolean {
  return Date.now() - toEpochMs(input) < 24 * 60 * 60 * 1000;
}

// Local calendar date offset from today as "YYYY-MM-DD" (e.g. -1 for
// yesterday) — never toISOString() here, since that reports UTC and drifts
// to the wrong day in KST (e.g. late-night raids).
export function dateStringWithOffset(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function todayDateString(): string {
  return dateStringWithOffset(0);
}

// 출석 기여도 집계 구간은 2주(14일) 단위로 자동 초기화된다. 별도의 기준일 설정이
// 없어 2024-01-01(월요일)을 앵커로 고정해 항상 같은 14일 경계가 반복되게 한다.
const BIWEEK_ANCHOR = new Date(2024, 0, 1);

export function getCurrentBiweekRange(): { start: string; end: string } {
  const now = new Date();
  const todayLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysSinceAnchor = Math.round(
    (todayLocalMidnight.getTime() - BIWEEK_ANCHOR.getTime()) / msPerDay
  );
  const offsetFromToday = ((daysSinceAnchor % 14) + 14) % 14;
  return {
    start: dateStringWithOffset(-offsetFromToday),
    end: dateStringWithOffset(13 - offsetFromToday),
  };
}

export function formatMonthDay(input: Date | number | string): string {
  const date = new Date(toEpochMs(input));
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

// Same UTC-string parsing rule as formatMonthDay (via toEpochMs) — for SQLite
// CURRENT_TIMESTAMP columns, not <input type="datetime-local"> values.
export function formatMonthDayTimeUtc(input: Date | number | string): string {
  const date = new Date(toEpochMs(input));
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
}

// For <input type="datetime-local"> values ("YYYY-MM-DDTHH:MM", no timezone
// marker) — these are meant as local wall-clock time, so parse them directly
// with `new Date()` rather than `toEpochMs`, which would force a UTC read
// meant only for SQLite's space-separated CURRENT_TIMESTAMP strings.
export function formatMonthDayTime(input: string): string {
  const date = new Date(input);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hours}:${minutes}`;
}

// Same local-time parsing rule as formatMonthDayTime — `deadline` is also a
// datetime-local string, not a UTC SQLite timestamp.
export function formatRemainingTime(deadline: string, now: Date): string {
  const diffMs = new Date(deadline).getTime() - now.getTime();
  if (diffMs <= 0) return "마감";

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (value: number) => String(value).padStart(2, "0");

  return days > 0
    ? `${days}일 ${pad(hours)}시:${pad(minutes)}분:${pad(seconds)}초 남음`
    : `${pad(hours)}시:${pad(minutes)}분:${pad(seconds)}초 남음`;
}
