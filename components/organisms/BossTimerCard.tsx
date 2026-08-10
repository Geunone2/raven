"use client";

import { BossTimer } from "@/lib/db/schema";
import { getNextSpawnAt } from "@/lib/constants/bossTimers";
import { TimerIcon } from "@/components/atoms/TimerIcon";
import { RouletteText } from "@/components/atoms/RouletteText";
import { useLiveNow } from "@/lib/hooks/useLiveNow";

function formatCountdown(target: Date, now: Date): string {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return "출현 중";

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const dd = String(days).padStart(2, "0");
  const hh = String(hours).padStart(2, "0");
  const mm = String(minutes).padStart(2, "0");
  const ss = String(seconds).padStart(2, "0");

  // Only ever show the two biggest non-trivial units — e.g. a day out shows
  // "01일00시" (drops minutes/seconds), under an hour shows "45분20초".
  let text: string;
  if (days > 0) {
    text = `${dd}일${hh}시`;
  } else if (hours > 0) {
    text = `${hh}시${mm}분`;
  } else if (minutes > 0) {
    text = `${mm}분${ss}초`;
  } else {
    text = `${ss}초`;
  }

  return `${text} 후 출현`;
}

type TimerStatus = { text: string; tone: "faint" | "waiting" | "spawned" };

const toneClasses: Record<TimerStatus["tone"], string> = {
  faint: "text-ink-faint",
  waiting: "text-ink",
  spawned: "font-semibold text-success",
};

export function BossTimerCard({ bosses }: { bosses: BossTimer[] }) {
  const now = useLiveNow();

  const getStatus = (boss: BossTimer): TimerStatus => {
    if (!now) return { text: "계산 중...", tone: "faint" };
    const target = getNextSpawnAt(boss);
    if (!target) return { text: "미확인", tone: "faint" };
    const spawned = target.getTime() <= now.getTime();
    return { text: formatCountdown(target, now), tone: spawned ? "spawned" : "waiting" };
  };

  const fieldBosses = bosses.filter((boss) => boss.type === "fixed" || boss.type === "respawn");
  const abyssBosses = bosses.filter(
    (boss) => boss.type === "weekly_wed_sun" || boss.type === "weekly_sunday"
  );

  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md min-h-100">
      <p className="text-base font-bold text-brand">보스 타이머</p>
      <p className="mt-3 text-xs font-medium text-ink-faint">보스 종류</p>

      <div className="mt-2">
        <p className="text-sm font-medium text-ink">필드 보스</p>
        {fieldBosses.length === 0 ? (
          <p className="mt-1 text-sm text-ink-faint">등록된 필드 보스가 없습니다.</p>
        ) : (
          <ul className="mt-1 space-y-1 pl-4 text-sm">
            {fieldBosses.map((boss) => {
              const status = getStatus(boss);
              return (
                <li key={boss.id} className="flex items-center justify-between gap-2">
                  <span>
                    {boss.name}
                    {boss.type === "respawn" && (
                      <span className="text-ink-faint"> - 운영진이 입력</span>
                    )}
                  </span>
                  <span className={`flex items-center gap-1 ${toneClasses[status.tone]}`}>
                    <TimerIcon />
                    <RouletteText text={status.text} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="my-3 border-t border-dashed border-edge" />

      <div>
        <p className="text-sm font-medium text-ink">어비스 보스(수/일)</p>
        {abyssBosses.length === 0 ? (
          <p className="mt-1 text-sm text-ink-faint">등록된 어비스 보스가 없습니다.</p>
        ) : (
          <ul className="mt-1 space-y-1 pl-4 text-sm">
            {abyssBosses.map((boss) => {
              const status = getStatus(boss);
              return (
                <li
                  key={boss.id}
                  className={`flex items-center justify-between gap-2 ${
                    boss.type === "weekly_sunday" ? "pl-4" : ""
                  }`}
                >
                  <span>{boss.name}</span>
                  <span className={`flex items-center gap-1 ${toneClasses[status.tone]}`}>
                    <TimerIcon />
                    <RouletteText text={status.text} />
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <p className="mt-3 text-xs text-ink-faint">
        고정 보스는 00:00 기준으로 타이머가 초기화됩니다.
      </p>
    </div>
  );
}
