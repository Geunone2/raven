"use client";

import { useState } from "react";
import { attendanceStatusLabels } from "@/lib/constants/schedule/attendance";
import type { ScheduleCheckinRosterEntry } from "@/lib/actions/schedule/scheduleCheckins";

export function ScheduleCheckinRoster({ roster }: { roster: ScheduleCheckinRosterEntry[] }) {
  const [open, setOpen] = useState(false);

  const checkedIn = roster.filter((entry) => entry.status === "checked_in").map((e) => e.nickname);
  const midJoin = roster.filter((entry) => entry.status === "mid_join").map((e) => e.nickname);

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="text-xs text-ink-muted hover:text-brand-bright hover:underline"
      >
        명단 확인 ({roster.length}명) {open ? "▲" : "▼"}
      </button>
      {open && (
        <div className="mt-2 space-y-1.5 rounded-md border border-edge bg-surface-sunken p-3 text-xs">
          <p>
            <span className="font-semibold text-success">
              {attendanceStatusLabels.checked_in}
            </span>{" "}
            <span className="text-ink-muted">
              {checkedIn.length > 0 ? checkedIn.join(", ") : "-"}
            </span>
          </p>
          <p>
            <span className="font-semibold text-info">{attendanceStatusLabels.mid_join}</span>{" "}
            <span className="text-ink-muted">{midJoin.length > 0 ? midJoin.join(", ") : "-"}</span>
          </p>
        </div>
      )}
    </div>
  );
}
