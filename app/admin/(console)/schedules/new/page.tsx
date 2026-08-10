import { createSchedule } from "@/lib/actions/schedules";
import { ScheduleForm } from "@/components/organisms/ScheduleForm";

export default function NewSchedulePage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        일정 등록
      </h1>
      <ScheduleForm action={createSchedule} />
    </div>
  );
}
