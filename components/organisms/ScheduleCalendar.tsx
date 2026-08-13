"use client";

import { useState } from "react";
import Link from "next/link";
import { DayPicker } from "react-day-picker";
import { ContentSchedule, ScheduleCheckin } from "@/lib/db/schema";
import { attendanceStatusLabels } from "@/lib/constants/attendance";

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

export function ScheduleCalendar({
  schedules,
  myCheckinByScheduleId,
  memberId,
}: {
  schedules: ContentSchedule[];
  myCheckinByScheduleId: Map<number, ScheduleCheckin>;
  memberId: number | null;
}) {
  const today = new Date();
  const [selected, setSelected] = useState<Date>(today);

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
    <div className="space-y-4">
      <DayPicker
        mode="single"
        selected={selected}
        onSelect={(date) => date && setSelected(date)}
        defaultMonth={today}
        hideNavigation
        showOutsideDays
        modifiers={{ hasEvent: eventDates }}
        classNames={{
          root: "w-full",
          month_caption: "flex justify-center pb-3 text-base font-semibold text-ink",
          month_grid: "w-full table-fixed border-collapse",
          weekday: "pb-1 text-center text-xs font-normal text-ink-faint",
          day: "p-0.5 text-center [&>button]:aspect-square [&>button]:w-full [&>button]:rounded-md [&>button]:text-sm [&>button]:text-ink [&>button]:hover:bg-surface-hover",
          selected: "[&>button]:bg-brand [&>button]:text-ink-inverse [&>button]:hover:bg-brand-bright",
          today: "[&>button]:font-bold [&>button]:text-brand",
          outside: "[&>button]:text-ink-faint/50",
        }}
        modifiersClassNames={{
          hasEvent:
            "relative after:absolute after:bottom-0.5 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-brand after:content-['']",
        }}
      />
      <div className="border-t border-edge pt-4">
        <p className="text-sm font-medium text-ink">{selectedKey} 일정</p>
        {selectedSchedules.length === 0 ? (
          <p className="mt-2 text-sm text-ink-faint">
            해당 날짜에 예정된 콘텐츠가 없습니다.
          </p>
        ) : (
          <ul className="mt-2 space-y-2">
            {selectedSchedules.map((schedule) => {
              const checkin = myCheckinByScheduleId.get(schedule.id);
              return (
                <li key={schedule.id} className="flex items-center justify-between text-sm">
                  <span>
                    {schedule.startTime}ㅣ{schedule.title}
                  </span>
                  {memberId && (
                    <Link href="/attendance" className="text-ink-muted hover:underline">
                      {checkin ? attendanceStatusLabels[checkin.status] : "미응답"}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
