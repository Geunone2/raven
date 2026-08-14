import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// 이 앱은 사실상 전부 KST(한국) 사용자를 대상으로 하는데, 배포 서버(Vercel)는
// 기본적으로 UTC로 돈다. 예전엔 Date의 로컬 getter(getHours 등)로 "로컬 시간"을
// 구했는데, 이게 서버(UTC)와 브라우저(KST)에서 서로 다른 값을 내놔서 (1) SSR
// 하이드레이션 텍스트 불일치(React #418)와 (2) "오늘 날짜" 계산이 자정~오전
// 9시(KST) 사이엔 하루 어긋나는 문제를 동시에 일으켰다(2026-08-15). dayjs +
// timezone 플러그인으로 항상 "Asia/Seoul" 기준으로 명시적으로 계산해서, 서버가
// 실제로 어느 시간대에서 돌든 결과가 항상 같게 만든다 — Vercel에 TZ 환경변수를
// 설정하는 방식(Vercel이 TZ를 예약어로 막아둬서 애초에 못 씀)에 기대지 않는다.
export const KST = "Asia/Seoul";

// 이미 utc/timezone 플러그인이 등록된 dayjs 인스턴스를 그대로 재노출한다 —
// 다른 파일(예: lib/actions/boss-timer/bossTimers.ts)에서 매번 다시
// dayjs.extend()를 반복하지 않고 이 인스턴스를 가져다 쓰게 하기 위함
// (2026-08-15).
export { dayjs };

// datetime-local 문자열("YYYY-MM-DDTHH:MM", 타임존 표기 없음)을 KST 벽시계
// 시간으로 명시 해석해서 ISO 문자열(UTC)로 바꾼다 — DB에 저장하기 전에 쓴다.
// 이 변환 없이 new Date(input).toISOString()을 쓰면, 그 코드가 서버(UTC)에서
// 실행될 때 같은 문자열이 실제보다 9시간 어긋난 시각으로 잘못 저장된다.
export function localInputToIso(input: string): string {
  return dayjs.tz(input, KST).toISOString();
}

// SQLite/Postgres의 CURRENT_TIMESTAMP류 문자열("YYYY-MM-DD HH:MM:SS", 타임존
// 표기 없는 UTC)을 UTC로 해석해 epoch ms로 바꾼다 — 대부분의 JS 엔진이 이걸
// 그냥 로컬 시간으로 오해하는 걸 막는다.
export function toEpochMs(input: Date | number | string): number {
  if (typeof input === "number") return input;
  if (typeof input === "string") return dayjs.utc(input).valueOf();
  return input.getTime();
}

export function isWithinLast24Hours(input: Date | number | string): boolean {
  return Date.now() - toEpochMs(input) < 24 * 60 * 60 * 1000;
}

// 서버가 어느 시간대에서 돌든 "지금"을 항상 KST 기준으로 얻어야 할 때 쓴다 —
// 달력 위젯의 "오늘" 기본값, 이번 달 일정 조회의 연/월처럼 dayjs 자체를 다루고
// 싶은 곳에서 이 인스턴스의 .year()/.month()/.date()/.format() 등을 직접 꺼내
// 쓴다(2026-08-15).
export function nowKst() {
  return dayjs().tz(KST);
}

// "YYYY-MM-DD"만 필요할 때(시:분 없이) — 공식 포럼 공지처럼 epoch 숫자로 오는
// 값과 DB의 UTC 문자열 둘 다 toEpochMs가 그대로 받아준다.
export function formatDateOnly(input: Date | number | string): string {
  return dayjs(toEpochMs(input)).tz(KST).format("YYYY-MM-DD");
}

// "YYYY-MM-DD HH:mm" — 연도 포함, 분 단위. 길드 통장 거래 내역처럼 화면에
// 연도까지 같이 보여줘야 하는 곳에서 쓴다.
export function formatDateTimeMinute(input: Date | number | string): string {
  return dayjs(toEpochMs(input)).tz(KST).format("YYYY-MM-DD HH:mm");
}

// KST 기준 오늘로부터 offset일만큼 떨어진 날짜를 "YYYY-MM-DD"로 — 서버가 어느
// 시간대에서 돌든 항상 KST 달력 기준으로 같은 날짜를 낸다(2026-08-15, dayjs
// 이관 전에는 new Date().toISOString() 등을 안 쓴 것도 이 이유와 같았다).
export function dateStringWithOffset(days: number): string {
  return dayjs().tz(KST).add(days, "day").format("YYYY-MM-DD");
}

export function todayDateString(): string {
  return dateStringWithOffset(0);
}

// 출석 기여도 집계 구간은 2주(14일) 단위로 자동 초기화된다. 별도의 기준일 설정이
// 없어 2024-01-01(월요일, KST)을 앵커로 고정해 항상 같은 14일 경계가 반복되게 한다.
const BIWEEK_ANCHOR = dayjs.tz("2024-01-01", KST);

export function getCurrentBiweekRange(): { start: string; end: string } {
  const todayKst = dayjs().tz(KST).startOf("day");
  const daysSinceAnchor = todayKst.diff(BIWEEK_ANCHOR, "day");
  const offsetFromToday = ((daysSinceAnchor % 14) + 14) % 14;
  return {
    start: dateStringWithOffset(-offsetFromToday),
    end: dateStringWithOffset(13 - offsetFromToday),
  };
}

export function formatMonthDay(input: Date | number | string): string {
  return dayjs(toEpochMs(input)).tz(KST).format("MM-DD");
}

// SQLite/Postgres CURRENT_TIMESTAMP 컬럼용 — <input type="datetime-local"> 값이
// 아니라 위 toEpochMs와 같은 UTC 파싱 규칙을 쓴다.
export function formatMonthDayTimeUtc(input: Date | number | string): string {
  return dayjs(toEpochMs(input)).tz(KST).format("MM-DD HH:mm");
}

// formatMonthDayTimeUtc에 초 단위를 더한 버전 — 관리자 길드원 목록의 "전투력
// 입력일" 컬럼처럼 정확한 입력 순서/시각까지 구분하고 싶을 때만 쓴다. 나머지
// 곳(전투력 저장 시각 안내 등)은 기존 분 단위 포맷을 그대로 쓴다.
export function formatMonthDayTimeUtcWithSeconds(input: Date | number | string): string {
  return dayjs(toEpochMs(input)).tz(KST).format("MM-DD HH:mm:ss");
}

// 엑셀 내보내기 전용 — 화면 표시용 포맷(연도 생략)과 달리, 엑셀은 나중에/다른
// 맥락에서 열어볼 수 있어서 연도를 포함한 전체 날짜를 쓴다. LootTable.tsx와
// MemberPanel.tsx에 완전히 동일한 함수가 중복돼 있던 것을 이쪽으로 옮겼다
// (2026-08-15).
export function formatFullDateTime(input: string): string {
  return dayjs(toEpochMs(input)).tz(KST).format("YYYY-MM-DD HH:mm:ss");
}

// <input type="datetime-local"> 값("YYYY-MM-DDTHH:MM", 타임존 표기 없음)은
// 입력한 사람의 벽시계 시간 그대로다 — 이 앱 사용자는 전부 KST라고 가정하고
// dayjs.tz(input, KST)로 명시적으로 KST로 해석한다. 예전엔 그냥 new Date(input)로
// 파싱해서, 이 함수가 서버(UTC)에서 실행되면 같은 문자열이 실제보다 9시간
// 어긋난 시각으로 잘못 해석되는 문제가 있었다(2026-08-15 수정).
export function formatMonthDayTime(input: string): string {
  return dayjs.tz(input, KST).format("MM-DD HH:mm");
}

// formatMonthDayTime과 같은 이유로 datetime-local 문자열을 KST로 명시 해석한다.
export function formatRemainingTime(deadline: string, now: Date): string {
  const diffMs = dayjs.tz(deadline, KST).valueOf() - now.getTime();
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
