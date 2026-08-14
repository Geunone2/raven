"use client";

import { useMemo, useState } from "react";
import { ContentSchedule } from "@/lib/db/schema";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { hashTone } from "@/lib/colorHash";
import { SERVERS } from "@/lib/constants/schedule/schedules";
import { ScheduleCardList } from "@/components/organisms/schedule/ScheduleCardList";
import { ScheduleCalendarView } from "@/components/organisms/schedule/ScheduleCalendarView";

type View = "calendar" | "table";

export function ScheduleViewToggle({ schedules }: { schedules: ContentSchedule[] }) {
  const [view, setView] = useState<View>("calendar");
  const [serverFilter, setServerFilter] = useState<string | null>(null);

  const filteredSchedules = useMemo(
    () =>
      serverFilter
        ? schedules.filter((schedule) => schedule.serverName === serverFilter)
        : schedules,
    [schedules, serverFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button
            type="button"
            size="lg"
            variant={view === "calendar" ? "primary" : "secondary"}
            onClick={() => setView("calendar")}
          >
            달력
          </Button>
          <Button
            type="button"
            size="lg"
            variant={view === "table" ? "primary" : "secondary"}
            onClick={() => setView("table")}
          >
            목록
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-faint">서버</span>
          <button
            type="button"
            onClick={() => setServerFilter(null)}
            className={`rounded-full transition-shadow ${
              serverFilter === null ? "ring-2 ring-brand" : "hover:ring-2 hover:ring-edge-strong"
            }`}
          >
            <Badge tone="neutral" size="lg">전체</Badge>
          </button>
          {SERVERS.map((server) => (
            <button
              key={server}
              type="button"
              onClick={() => setServerFilter(server)}
              className={`rounded-full transition-shadow ${
                serverFilter === server
                  ? "ring-2 ring-brand"
                  : "hover:ring-2 hover:ring-edge-strong"
              }`}
            >
              <Badge tone={hashTone(server)} size="lg">{server}</Badge>
            </button>
          ))}
        </div>
      </div>

      {view === "calendar" ? (
        <ScheduleCalendarView schedules={filteredSchedules} />
      ) : (
        <ScheduleCardList schedules={filteredSchedules} />
      )}
    </div>
  );
}
