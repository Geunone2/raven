import { notFound } from "next/navigation";
import { getSchedule, updateSchedule } from "@/lib/actions/schedules";
import { ScheduleForm } from "@/components/organisms/ScheduleForm";

export default async function EditSchedulePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const schedule = await getSchedule(Number(id));

  if (!schedule) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        일정 수정
      </h1>
      <ScheduleForm schedule={schedule} action={updateSchedule.bind(null, schedule.id)} />
    </div>
  );
}
