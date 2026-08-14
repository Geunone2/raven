import { getSchedules } from "@/lib/actions/schedule/schedules";
import { SCHEDULE_PERIODS, type SchedulePeriod } from "@/lib/constants/schedule/schedules";
import { ScheduleFilterBar } from "@/components/organisms/schedule/ScheduleFilterBar";
import { ScheduleTable } from "@/components/organisms/schedule/ScheduleTable";

export default async function SchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string; period?: string }>;
}) {
  const { type, period: periodParam } = await searchParams;
  // 기본값은 "오늘 일정만" — searchParams에 period가 없을 때만 적용된다.
  const period: SchedulePeriod = (SCHEDULE_PERIODS as readonly string[]).includes(
    periodParam ?? ""
  )
    ? (periodParam as SchedulePeriod)
    : "today";
  const schedules = await getSchedules({ type, period });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        콘텐츠 일정표
      </h1>
      <ScheduleFilterBar defaultType={type} activePeriod={period} />
      <ScheduleTable schedules={schedules} />
    </div>
  );
}
