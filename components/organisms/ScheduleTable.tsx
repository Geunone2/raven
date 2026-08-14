import Link from "next/link";
import { ContentSchedule } from "@/lib/db/schema";
import { contentTypeLabels } from "@/lib/constants/schedules";
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
      {/* 서버/참여 길드는 태블릿 미만에서 숨긴다(2026-08-14) — 날짜/시작 시간은
          한 칸으로 합쳐서 항상 보이게 유지한다. */}
      <table className="w-full min-w-[560px] text-left text-sm md:min-w-[820px] xl:min-w-[1000px]">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">날짜</th>
            <th className="px-4 py-3 font-medium">콘텐츠</th>
            <th className="px-4 py-3 font-medium">제목</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">서버</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">참여 길드</th>
            {!readOnly && <th className="px-4 py-3 font-medium" />}
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {schedules.map((schedule) => (
            <tr key={schedule.id}>
              <td className="px-4 py-3 font-medium text-ink">
                <p>{schedule.date}</p>
                <p className="text-xs font-normal text-ink-faint">{schedule.startTime}</p>
              </td>
              <td className="px-4 py-3">
                <Badge>{contentTypeLabels[schedule.type]}</Badge>
              </td>
              <td className="px-4 py-3">
                <p>{schedule.title}</p>
                {/* xl 미만에서만 참여 길드를 제목 아래에 같이 보여준다 — 칼럼은
                    숨기되 정보는 잃지 않게 하기 위함. */}
                <p className="mt-1 xl:hidden">
                  <Badge tone={hashTone(schedule.targetGuild)} size="sm">
                    {schedule.targetGuild}
                  </Badge>
                </p>
              </td>
              <td className="hidden px-4 py-3 md:table-cell">
                {schedule.serverName ? (
                  <Badge tone={hashTone(schedule.serverName)}>{schedule.serverName}</Badge>
                ) : (
                  <span className="text-ink-faint">-</span>
                )}
              </td>
              <td className="hidden px-4 py-3 xl:table-cell">
                <Badge tone={hashTone(schedule.targetGuild)}>{schedule.targetGuild}</Badge>
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
          ))}
        </tbody>
      </table>
    </div>
  );
}
