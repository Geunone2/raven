import { BossTimer, bossTimerTypes } from "@/lib/db/schema";

export const bossTimerTypeLabels: Record<(typeof bossTimerTypes)[number], string> = {
  fixed: "고정 시간",
  respawn: "리젠 타이머",
  weekly_wed_sun: "어비스(수/일)",
  weekly_sunday: "어비스 특수(일요일)",
};

const SUNDAY = 0;
const WEDNESDAY = 3;

function nextWeeklyOccurrence(fixedTime: string, days: number[]): Date {
  const [hour, minute] = fixedTime.split(":").map(Number);
  const candidate = new Date();
  candidate.setHours(hour, minute, 0, 0);
  while (!days.includes(candidate.getDay()) || candidate.getTime() <= Date.now()) {
    candidate.setDate(candidate.getDate() + 1);
    candidate.setHours(hour, minute, 0, 0);
  }
  return candidate;
}

export function getNextSpawnAt(boss: BossTimer): Date | null {
  if (boss.type === "fixed") {
    if (!boss.fixedTime) return null;
    const [hour, minute] = boss.fixedTime.split(":").map(Number);
    const next = new Date();
    next.setHours(hour, minute, 0, 0);
    if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1);
    return next;
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
