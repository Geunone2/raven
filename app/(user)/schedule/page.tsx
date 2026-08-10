import { getSchedules } from "@/lib/actions/schedules";
import { ScheduleViewToggle } from "@/components/organisms/ScheduleViewToggle";

export default async function MemberSchedulePage() {
  const schedules = await getSchedules();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        콘텐츠 일정표
      </h1>
      <ScheduleViewToggle schedules={schedules} />
    </div>
  );
}
