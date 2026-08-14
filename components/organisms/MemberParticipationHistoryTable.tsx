import type { MemberParticipationHistoryEntry } from "@/lib/actions/members";
import { contentTypeLabels, bossTierLabels } from "@/lib/constants/schedules";
import { participationStatusLabels, participationStatusTone } from "@/lib/constants/participations";
import { Badge } from "@/components/atoms/Badge";

export function MemberParticipationHistoryTable({
  history,
}: {
  history: MemberParticipationHistoryEntry[];
}) {
  if (history.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-ink-faint">
        참여 체크 이력이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      {/* 콘텐츠/보스 등급은 태블릿 미만에서 숨긴다(2026-08-14) — 일정 제목 아래에
          날짜를 같이 보여줘서 정보는 유지한다. */}
      <table className="w-full min-w-[440px] text-left text-sm md:min-w-[600px] xl:min-w-[760px]">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="hidden px-4 py-3 font-medium md:table-cell">날짜</th>
            <th className="px-4 py-3 font-medium">일정</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">콘텐츠</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">보스 등급</th>
            <th className="px-4 py-3 font-medium">참여 상태</th>
            <th className="px-4 py-3 font-medium">획득 점수</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {history.map((entry) => (
            <tr key={entry.scheduleId}>
              <td className="hidden px-4 py-3 text-ink-faint md:table-cell">{entry.date}</td>
              <td className="px-4 py-3 font-medium text-ink">
                <p>{entry.scheduleTitle}</p>
                <p className="text-xs font-normal text-ink-faint md:hidden">{entry.date}</p>
              </td>
              <td className="hidden px-4 py-3 text-ink-faint xl:table-cell">
                {contentTypeLabels[entry.type]}
              </td>
              <td className="hidden px-4 py-3 text-ink-faint xl:table-cell">
                {bossTierLabels[entry.bossTier]}
              </td>
              <td className="px-4 py-3">
                {entry.status ? (
                  <Badge tone={participationStatusTone[entry.status]}>
                    {participationStatusLabels[entry.status]}
                  </Badge>
                ) : (
                  <Badge tone="neutral">미체크</Badge>
                )}
              </td>
              <td className="px-4 py-3 font-medium text-brand">{entry.points}점</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
