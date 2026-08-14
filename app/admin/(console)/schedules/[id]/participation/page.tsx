import { notFound } from "next/navigation";
import { getSchedule } from "@/lib/actions/schedules";
import { getParticipationsForSchedule } from "@/lib/actions/participations";
import { contentTypeLabels, getScheduleBasePoints } from "@/lib/constants/schedules";
import { ParticipationTable } from "@/components/organisms/ParticipationTable";
import { ParticipationExportButton } from "@/components/atoms/ParticipationExportButton";

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
  const { total: basePoints } = getScheduleBasePoints(schedule);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-ink">
            참여 체크 — {schedule.title}
          </h1>
          <p className="mt-1 text-sm text-ink-faint">
            {schedule.date} · {contentTypeLabels[schedule.type]} · 보스 기여도 점수 {basePoints}점
          </p>
          {schedule.type === "abyss" && (
            <p className="mt-1 text-sm text-ink-faint">
              어비스는 레벨 55 이상 입장 가능 · 심연의 초대장 보유 여부를 확인하세요.
            </p>
          )}
        </div>
        <ParticipationExportButton
          scheduleTitle={schedule.title}
          rows={rows}
          basePoints={basePoints}
          showTicket={schedule.type === "abyss"}
        />
      </div>
      <ParticipationTable
        scheduleId={scheduleId}
        rows={rows}
        basePoints={basePoints}
        showTicket={schedule.type === "abyss"}
      />
    </div>
  );
}
