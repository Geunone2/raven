import Link from "next/link";
import { BossTimer } from "@/lib/db/schema";
import { bossTimerTypeLabels, getNextSpawnAt } from "@/lib/constants/bossTimers";
import { Badge } from "@/components/atoms/Badge";
import { deleteBossTimer } from "@/lib/actions/bossTimers";

function formatSpawn(date: Date | null) {
  if (!date) return "미확인";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hour = String(date.getHours()).padStart(2, "0");
  const minute = String(date.getMinutes()).padStart(2, "0");
  return `${month}-${day} ${hour}:${minute}`;
}

export function BossTimerTable({
  bosses,
  readOnly = false,
}: {
  bosses: BossTimer[];
  readOnly?: boolean;
}) {
  if (bosses.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        등록된 보스 타이머가 없습니다.
      </p>
    );
  }

  const sorted = [...bosses].sort((a, b) => {
    const aSpawn = getNextSpawnAt(a);
    const bSpawn = getNextSpawnAt(b);
    if (!aSpawn && !bSpawn) return 0;
    if (!aSpawn) return 1;
    if (!bSpawn) return -1;
    return aSpawn.getTime() - bSpawn.getTime();
  });

  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      {/* 종류/메모는 태블릿 미만에서 숨긴다(2026-08-14) — 보스명과 다음 출현
          시각(타이머의 핵심 정보)만 있으면 화면이 깨지지 않는다. */}
      <table className="w-full min-w-[420px] text-left text-sm md:min-w-[560px] xl:min-w-[700px]">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">보스명</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">종류</th>
            <th className="px-4 py-3 font-medium">다음 출현</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">메모</th>
            {!readOnly && <th className="px-4 py-3 font-medium" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {sorted.map((boss) => (
            <tr key={boss.id}>
              <td className="px-4 py-3 font-medium text-ink">
                {boss.name}
                <span className="ml-1.5 md:hidden">
                  <Badge>{bossTimerTypeLabels[boss.type]}</Badge>
                </span>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                <Badge>{bossTimerTypeLabels[boss.type]}</Badge>
              </td>
              <td className="px-4 py-3 text-ink-faint">{formatSpawn(getNextSpawnAt(boss))}</td>
              <td className="hidden px-4 py-3 text-ink-faint xl:table-cell">{boss.memo ?? "-"}</td>
              {!readOnly && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    <Link
                      href={`/admin/boss-timers/${boss.id}`}
                      className="text-sm text-ink-muted hover:underline"
                    >
                      수정
                    </Link>
                    <form action={deleteBossTimer.bind(null, boss.id)}>
                      <button type="submit" className="text-sm text-danger hover:underline">
                        삭제
                      </button>
                    </form>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
