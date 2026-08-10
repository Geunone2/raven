import { notFound } from "next/navigation";
import { getSchedule } from "@/lib/actions/schedules";
import { getParticipationsForSchedule } from "@/lib/actions/participations";
import { contentTypeLabels } from "@/lib/constants/schedules";
import { ParticipationTable } from "@/components/organisms/ParticipationTable";

export default async function ScheduleParticipationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scheduleId = Number(id);
  const schedule = await getSchedule(scheduleId);

  if (!schedule) {
    notFound();
  }

  const rows = await getParticipationsForSchedule(scheduleId);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          참여 체크 — {schedule.title}
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          {schedule.date} · {contentTypeLabels[schedule.type]}
        </p>
        {schedule.type === "abyss" && (
          <p className="mt-1 text-sm text-ink-faint">
            어비스는 레벨 55 이상 입장 가능 · 심연의 초대장 보유 여부를 확인하세요.
          </p>
        )}
      </div>
      <ParticipationTable
        scheduleId={scheduleId}
        rows={rows}
        showTicket={schedule.type === "abyss"}
      />
    </div>
  );
}
