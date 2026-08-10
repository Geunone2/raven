import Link from "next/link";
import { ContentSchedule } from "@/lib/db/schema";
import {
  contentTypeLabels,
  getEffectiveScheduleStatus,
  scheduleStatusLabels,
  scheduleStatusTone,
  targetAudienceLabels,
} from "@/lib/constants/schedules";
import { Badge } from "@/components/atoms/Badge";
import { hashTone } from "@/lib/colorHash";
import { deleteSchedule } from "@/lib/actions/schedules";

export function ScheduleTable({
  schedules,
  readOnly = false,
}: {
  schedules: ContentSchedule[];
  readOnly?: boolean;
}) {
  if (schedules.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        등록된 일정이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      <table className="w-full min-w-[1000px] text-left text-sm">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">날짜</th>
            <th className="px-4 py-3 font-medium">집결 / 시작</th>
            <th className="px-4 py-3 font-medium">콘텐츠</th>
            <th className="px-4 py-3 font-medium">제목</th>
            <th className="px-4 py-3 font-medium">서버</th>
            <th className="px-4 py-3 font-medium">대상</th>
            <th className="px-4 py-3 font-medium">장소</th>
            <th className="px-4 py-3 font-medium">상태</th>
            {!readOnly && <th className="px-4 py-3 font-medium" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {schedules.map((schedule) => {
            const effectiveStatus = getEffectiveScheduleStatus(schedule);
            return (
            <tr key={schedule.id}>
              <td className="px-4 py-3 font-medium text-ink">
                {schedule.date}
              </td>
              <td className="px-4 py-3 text-ink-faint">
                {schedule.gatherTime ?? "-"} / {schedule.startTime}
              </td>
              <td className="px-4 py-3">
                <Badge>{contentTypeLabels[schedule.type]}</Badge>
              </td>
              <td className="px-4 py-3">{schedule.title}</td>
              <td className="px-4 py-3">
                {schedule.serverName ? (
                  <Badge tone={hashTone(schedule.serverName)}>{schedule.serverName}</Badge>
                ) : (
                  <span className="text-ink-faint">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-ink-faint">
                {targetAudienceLabels[schedule.targetAudience]}
              </td>
              <td className="px-4 py-3 text-ink-faint">
                {schedule.location ?? "-"}
              </td>
              <td className="px-4 py-3">
                <Badge tone={scheduleStatusTone[effectiveStatus]}>
                  {scheduleStatusLabels[effectiveStatus]}
                </Badge>
              </td>
              {!readOnly && (
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-3">
                    {schedule.type === "guild_dungeon" ? (
                      <Link
                        href={`/admin/schedules/${schedule.id}/dungeon`}
                        className="text-sm text-ink-muted hover:underline"
                      >
                        던전 기록
                      </Link>
                    ) : (
                      <Link
                        href={`/admin/schedules/${schedule.id}/participation`}
                        className="text-sm text-ink-muted hover:underline"
                      >
                        참여 체크
                      </Link>
                    )}
                    <Link
                      href={`/admin/schedules/${schedule.id}`}
                      className="text-sm text-ink-muted hover:underline"
                    >
                      수정
                    </Link>
                    <form action={deleteSchedule.bind(null, schedule.id)}>
                      <button
                        type="submit"
                        className="text-sm text-danger hover:underline"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
