"use client";

import { useMemo, useState } from "react";
import { ContentSchedule, ScheduleCheckin } from "@/lib/db/schema";
import { SERVERS } from "@/lib/constants/schedules";
import { Badge } from "@/components/atoms/Badge";
import { hashTone } from "@/lib/colorHash";
import { ScheduleCheckinList } from "@/components/organisms/ScheduleCheckinList";
import type { ScheduleCheckinRosterEntry } from "@/lib/actions/scheduleCheckins";

const ALL = "전체";

export function AttendanceCheckinPanel({
  schedules,
  myCheckinByScheduleId,
  myGuildName,
  rosterByScheduleId,
}: {
  schedules: ContentSchedule[];
  myCheckinByScheduleId: Map<number, ScheduleCheckin>;
  myGuildName: string | null;
  rosterByScheduleId: Map<number, ScheduleCheckinRosterEntry[]>;
}) {
  const [serverFilter, setServerFilter] = useState(ALL);

  const filteredSchedules = useMemo(
    () =>
      serverFilter === ALL
        ? schedules
        : schedules.filter((schedule) => schedule.serverName === serverFilter),
    [schedules, serverFilter]
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">서버</span>
        <button
          type="button"
          onClick={() => setServerFilter(ALL)}
          className={`rounded-full transition-shadow ${
            serverFilter === ALL ? "ring-2 ring-brand" : "hover:ring-2 hover:ring-edge-strong"
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

      <ScheduleCheckinList
        schedules={filteredSchedules}
        myCheckinByScheduleId={myCheckinByScheduleId}
        myGuildName={myGuildName}
        rosterByScheduleId={rosterByScheduleId}
      />
    </div>
  );
}
