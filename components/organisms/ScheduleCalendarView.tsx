"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ContentSchedule } from "@/lib/db/schema";
import {
  contentTypeLabels,
  contentTypeTone,
  getEffectiveScheduleStatus,
  scheduleStatusLabels,
  scheduleStatusTone,
  targetAudienceLabels,
} from "@/lib/constants/schedules";
import { Badge } from "@/components/atoms/Badge";
import { CalendarDropdown } from "@/components/atoms/CalendarDropdown";
import { hashTone } from "@/lib/colorHash";

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function ScheduleCalendarView({ schedules }: { schedules: ContentSchedule[] }) {
  const today = new Date();
  const [selected, setSelected] = useState<Date>(today);
  const currentYear = today.getFullYear();
  const startMonth = new Date(currentYear - 3, 0);
  const endMonth = new Date(currentYear + 1, 11);

  const schedulesByDate = new Map<string, ContentSchedule[]>();
  for (const schedule of schedules) {
    const list = schedulesByDate.get(schedule.date) ?? [];
    list.push(schedule);
    schedulesByDate.set(schedule.date, list);
  }
  const eventDates = [...schedulesByDate.keys()].map(parseDateKey);

  const selectedKey = toDateKey(selected);
  const selectedSchedules = schedulesByDate.get(selectedKey) ?? [];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      <div className="rounded-xl border border-edge bg-surface p-4 shadow-md">
        <DayPicker
          mode="single"
          selected={selected}
          onSelect={(date) => date && setSelected(date)}
          defaultMonth={today}
          startMonth={startMonth}
          endMonth={endMonth}
          captionLayout="dropdown"
          showOutsideDays
          modifiers={{ hasEvent: eventDates }}
          components={{ Dropdown: CalendarDropdown }}
          classNames={{
            root: "w-full",
            month: "relative",
            month_caption: "flex justify-center px-9 pb-3",
            dropdowns: "flex flex-wrap items-center justify-center gap-1.5",
            button_previous:
              "absolute left-0 top-0 rounded-md p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink",
            button_next:
              "absolute right-0 top-0 rounded-md p-1.5 text-ink-muted hover:bg-surface-hover hover:text-ink",
            month_grid: "w-full table-fixed border-collapse",
            weekday: "pb-2 text-center text-xs font-normal text-ink-faint",
            day: "p-1 text-center [&>button]:aspect-square [&>button]:w-full [&>button]:rounded-md [&>button]:text-sm [&>button]:text-ink [&>button]:hover:bg-surface-hover",
            selected: "[&>button]:bg-brand [&>button]:text-surface [&>button]:hover:bg-brand-bright",
            today: "[&>button]:font-bold [&>button]:text-brand",
            outside: "[&>button]:text-ink-faint/50",
          }}
          modifiersClassNames={{
            hasEvent:
              "relative after:absolute after:bottom-1 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-brand after:content-['']",
          }}
        />
      </div>

      <div className="rounded-xl border border-edge bg-surface p-4 shadow-md">
        <p className="text-sm font-medium text-ink">{selectedKey} 일정</p>
        {selectedSchedules.length === 0 ? (
          <p className="mt-4 text-sm text-ink-faint">
            해당 날짜에 예정된 콘텐츠가 없습니다.
          </p>
        ) : (
          <ul className="mt-4 max-h-[28rem] space-y-3 overflow-y-auto pr-1">
            {selectedSchedules.map((schedule) => {
              const effectiveStatus = getEffectiveScheduleStatus(schedule);
              return (
              <li
                key={schedule.id}
                className="rounded-md border border-edge p-3 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    {schedule.serverName && (
                      <Badge tone={hashTone(schedule.serverName)}>{schedule.serverName}</Badge>
                    )}
                    <Badge tone={contentTypeTone[schedule.type]}>
                      {contentTypeLabels[schedule.type]}
                    </Badge>
                    <span className="font-medium text-ink">{schedule.title}</span>
                  </div>
                  <Badge tone={scheduleStatusTone[effectiveStatus]}>
                    {scheduleStatusLabels[effectiveStatus]}
                  </Badge>
                </div>
                <div className="mt-2 space-y-1 text-xs text-ink-faint">
                  <p>
                    집결 / 시작 {schedule.gatherTime ?? "-"} / {schedule.startTime}
                  </p>
                  <p>대상 {targetAudienceLabels[schedule.targetAudience]}</p>
                  {schedule.location && <p>장소 {schedule.location}</p>}
                </div>
              </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
