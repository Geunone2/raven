import type { ContributionStats } from "@/lib/actions/scheduleCheckins";

export function MyContributionCard({
  myPoints,
  totalPoints,
  ratio,
  periodStart,
  periodEnd,
}: ContributionStats) {
  const barWidth = Math.min(ratio, 100);

  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-3 shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-sm font-bold text-brand">내 기여도</p>
        <span className="text-[11px] text-ink-faint">
          {periodStart.slice(5)} ~ {periodEnd.slice(5)}
        </span>
      </div>

      <div className="mt-2 flex items-end justify-between">
        <div>
          <p className="text-[11px] text-ink-faint">내 점수</p>
          <p className="text-xl font-bold text-brand">
            {myPoints}
            <span className="ml-0.5 text-xs font-medium text-ink-muted">점</span>
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-ink-faint">길드 기여도</p>
          <p className="text-xl font-bold text-info">
            {ratio}
            <span className="ml-0.5 text-xs font-medium text-ink-muted">%</span>
          </p>
        </div>
      </div>

      <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div
          className="h-full rounded-full bg-info transition-all"
          style={{ width: `${barWidth}%` }}
        />
      </div>

      <p className="mt-1.5 text-[11px] text-ink-faint">
        길드 전체 합산 {totalPoints}점 중 내 점수 비율 (2주마다 초기화)
      </p>
    </div>
  );
}
