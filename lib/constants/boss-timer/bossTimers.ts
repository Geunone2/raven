import { BossTimer, bossTimerTypes } from "@/lib/db/schema";
import { dayjs, KST } from "@/lib/time";

export const bossTimerTypeLabels: Record<(typeof bossTimerTypes)[number], string> = {
  fixed: "고정 시간",
  respawn: "리젠 타이머",
  weekly_wed_sun: "어비스(수/일)",
  weekly_sunday: "어비스 특수(일요일)",
};

const SUNDAY = 0;
const WEDNESDAY = 3;

// fixedTime("HH:MM")은 관리자가 입력한 KST 벽시계 시각이다 — new Date() +
// 로컬 getter/setter를 쓰면 서버 런타임의 시간대(Vercel은 UTC)로 계산돼 실제
// 출현 시각과 최대 9시간 어긋나는 문제가 있었다(2026-08-15 수정). dayjs를
// KST에 명시적으로 고정해 계산하면 서버가 어느 시간대에서 돌든 결과가 같다.
function nextWeeklyOccurrence(fixedTime: string, days: number[]): Date {
  const [hour, minute] = fixedTime.split(":").map(Number);
  let candidate = dayjs().tz(KST).hour(hour).minute(minute).second(0).millisecond(0);
  while (!days.includes(candidate.day()) || candidate.valueOf() <= Date.now()) {
    candidate = candidate.add(1, "day").hour(hour).minute(minute).second(0).millisecond(0);
  }
  return candidate.toDate();
}

export function getNextSpawnAt(boss: BossTimer): Date | null {
  if (boss.type === "fixed") {
    if (!boss.fixedTime) return null;
    const [hour, minute] = boss.fixedTime.split(":").map(Number);
    let next = dayjs().tz(KST).hour(hour).minute(minute).second(0).millisecond(0);
    if (next.valueOf() <= Date.now()) next = next.add(1, "day");
    return next.toDate();
  }

  if (boss.type === "weekly_wed_sun") {
    if (!boss.fixedTime) return null;
    return nextWeeklyOccurrence(boss.fixedTime, [WEDNESDAY, SUNDAY]);
  }

  if (boss.type === "weekly_sunday") {
    if (!boss.fixedTime) return null;
    return nextWeeklyOccurrence(boss.fixedTime, [SUNDAY]);
  }

  if (!boss.lastKilledAt || !boss.respawnMinutes) return null;
  return new Date(new Date(boss.lastKilledAt).getTime() + boss.respawnMinutes * 60_000);
}
