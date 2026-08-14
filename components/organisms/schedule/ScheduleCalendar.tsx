"use client";

import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { ContentSchedule } from "@/lib/db/schema";
import { nowKst } from "@/lib/time";

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

// KST 기준 "오늘"을 로컬 Date 생성자로 명시적으로 다시 만든다 — new Date()를
// 그대로 쓰면 서버(UTC)와 브라우저(KST)가 자정~오전 9시(KST) 사이엔 서로 다른
// 날짜를 "오늘"로 계산해서 하이드레이션이 어긋났다(2026-08-15 수정).
function getTodayKst() {
  const kst = nowKst();
  return new Date(kst.year(), kst.month(), kst.date());
}

export function ScheduleCalendar({
  schedules,
}: {
  schedules: ContentSchedule[];
}) {
  const [today] = useState(getTodayKst);
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
            {selectedSchedules.map((schedule) => (
              <li key={schedule.id} className="flex items-center gap-1 text-sm">
                <span className="shrink-0 text-ink-faint">{schedule.startTime}ㅣ</span>
                <span className="min-w-0 flex-1 truncate">{schedule.title}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
