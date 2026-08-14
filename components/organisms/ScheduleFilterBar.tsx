import Link from "next/link";
import { contentTypes } from "@/lib/db/schema";
import {
  contentTypeLabels,
  SCHEDULE_PERIODS,
  SCHEDULE_PERIOD_LABELS,
  type SchedulePeriod,
} from "@/lib/constants/schedules";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Button } from "@/components/atoms/Button";

export function ScheduleFilterBar({
  defaultType,
  activePeriod,
}: {
  defaultType?: string;
  activePeriod: SchedulePeriod;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">기간</span>
        {SCHEDULE_PERIODS.map((period) => (
          <Link
            key={period}
            // type 값은 유지한 채 기간만 바꾼다 — 이 링크를 누르는 즉시(폼 제출 없이)
            // 서버가 해당 기간의 일정만 새로 조회해서 내려준다.
            href={`/admin/schedules?${new URLSearchParams({
              ...(defaultType ? { type: defaultType } : {}),
              period,
            }).toString()}`}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activePeriod === period
                ? "border-brand bg-brand text-ink-inverse"
                : "border-edge-strong text-ink-muted hover:border-brand"
            }`}
          >
            {SCHEDULE_PERIOD_LABELS[period]}
          </Link>
        ))}
      </div>

      <form
        action="/admin/schedules"
        className="flex flex-wrap items-end justify-between gap-3"
      >
        <div className="flex flex-wrap items-end gap-3">
          {/* 기간 필터는 위 링크로 이미 적용된 값을 hidden으로 함께 제출해 유지한다. */}
          <input type="hidden" name="period" value={activePeriod} />
          <CustomSelect
            name="type"
            defaultValue={defaultType ?? ""}
            className="w-40 shrink-0"
            options={[
              { value: "", label: "전체 콘텐츠" },
              ...contentTypes.map((type) => ({ value: type, label: contentTypeLabels[type] })),
            ]}
          />
          <Button type="submit" variant="secondary">
            필터
          </Button>
        </div>
        <Link href="/admin/schedules/new">
          <Button type="button">일정 등록</Button>
        </Link>
      </form>
    </div>
  );
}
