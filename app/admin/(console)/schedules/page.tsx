import { getSchedules } from "@/lib/actions/schedules";
import { ScheduleFilterBar } from "@/components/organisms/ScheduleFilterBar";
import { ScheduleTable } from "@/components/organisms/ScheduleTable";

export default async function SchedulesPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>;
}) {
  const { type } = await searchParams;
  const schedules = await getSchedules({ type });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        콘텐츠 일정표
      </h1>
      <ScheduleFilterBar defaultType={type} />
      <ScheduleTable schedules={schedules} />
    </div>
  );
}
