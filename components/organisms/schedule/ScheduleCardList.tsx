"use client";

import { useMemo } from "react";
import { ContentSchedule } from "@/lib/db/schema";
import { contentTypeLabels, contentTypeTone } from "@/lib/constants/schedule/schedules";
import { Badge } from "@/components/atoms/Badge";
import { PaginationControls } from "@/components/molecules/PaginationControls";
import { usePagination } from "@/lib/hooks/usePagination";
import { hashTone } from "@/lib/colorHash";

const PAGE_SIZE = 8;

export function ScheduleCardList({ schedules }: { schedules: ContentSchedule[] }) {
  const sorted = useMemo(
    () =>
      [...schedules].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? 1 : -1;
        return a.startTime < b.startTime ? 1 : -1;
      }),
    [schedules]
  );

  const { setPage, pageCount, currentPage, paged } = usePagination(sorted, PAGE_SIZE);

  if (schedules.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        등록된 일정이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {paged.map((schedule) => (
          <div
            key={schedule.id}
            className="flex flex-col gap-3 rounded-xl border border-edge bg-surface p-4 text-sm shadow-md sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="flex items-baseline gap-2 sm:w-32 sm:shrink-0 sm:flex-col sm:items-start sm:gap-0.5">
              <span className="whitespace-nowrap font-semibold text-ink">{schedule.date}</span>
              <span className="whitespace-nowrap text-xs text-ink-faint">
                {schedule.startTime}
              </span>
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                {schedule.serverName && (
                  <Badge tone={hashTone(schedule.serverName)}>{schedule.serverName}</Badge>
                )}
                <Badge tone={contentTypeTone[schedule.type]}>
                  {contentTypeLabels[schedule.type]}
                </Badge>
              </div>
              <span className="truncate font-medium text-ink">{schedule.title}</span>
            </div>
            <div className="sm:shrink-0">
              <Badge tone={hashTone(schedule.targetGuild)}>{schedule.targetGuild}</Badge>
            </div>
          </div>
        ))}
      </div>

      <PaginationControls currentPage={currentPage} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
