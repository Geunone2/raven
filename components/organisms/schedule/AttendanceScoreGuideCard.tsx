function StarIcon() {
  return (
    <svg viewBox="0 0 20 20" className="size-3 shrink-0" fill="currentColor" aria-hidden="true">
      <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.79L10 14.77l-5.2 2.74.99-5.79-4.21-4.1 5.82-.85L10 1.5z" />
    </svg>
  );
}

function BossScore({ stars, label, points }: { stars?: number; label: string; points: string }) {
  return (
    <div className="rounded-md border border-warning/25 bg-warning/10 px-1 py-1.5 text-center">
      <div className="flex items-center justify-center gap-0.5 text-warning">
        {stars ? (
          <>
            <StarIcon />
            <span className="text-[11px] font-semibold">×{stars}</span>
          </>
        ) : (
          <span className="text-[11px] font-semibold text-danger">어비스</span>
        )}
      </div>
      <p className="mt-0.5 text-[11px] text-ink">{label}</p>
      <p className="text-xs font-bold text-brand">{points}</p>
    </div>
  );
}

export function AttendanceScoreGuideCard() {
  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-3 shadow-md">
      <p className="text-sm font-bold text-brand">출석 점수 안내</p>

      <div className="mt-2 grid grid-cols-4 gap-1.5">
        <BossScore stars={3} label="3성 보스" points="3점" />
        <BossScore stars={4} label="4성 보스" points="6점" />
        <BossScore stars={5} label="5성 보스" points="6점" />
        <BossScore label="어비스 보스" points="6점" />
      </div>

      <div className="mt-1.5 flex items-center justify-between rounded-md border border-info/25 bg-info/10 px-2 py-1.5 text-xs">
        <span className="font-semibold text-info">전투</span>
        <span className="font-bold text-brand">1시간당 3점 추가</span>
      </div>

      <div className="mt-1.5 flex items-center justify-between rounded-md border border-danger/25 bg-danger/10 px-2 py-1.5 text-xs">
        <span className="font-semibold text-danger">어비스 띵</span>
        <span className="font-bold text-brand">6점 추가</span>
      </div>

      <p className="mt-1.5 text-[11px] text-ink-faint">
        * 위 점수는 운영진이 일정별로 직접 조정할 수 있습니다. 중간합류 시 최종 점수의 1/2이
        부여됩니다.
      </p>
    </div>
  );
}
