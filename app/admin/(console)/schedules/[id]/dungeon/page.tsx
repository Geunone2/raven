import { notFound } from "next/navigation";
import { getSchedule } from "@/lib/actions/schedules";
import { getDungeonRun, saveDungeonRun } from "@/lib/actions/dungeonRuns";
import { getParticipationsForSchedule } from "@/lib/actions/participations";
import { DungeonRunForm } from "@/components/organisms/DungeonRunForm";
import { ParticipationTable } from "@/components/organisms/ParticipationTable";

export default async function DungeonRunPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scheduleId = Number(id);
  const schedule = await getSchedule(scheduleId);

  if (!schedule || schedule.type !== "guild_dungeon") {
    notFound();
  }

  const [run, rows] = await Promise.all([
    getDungeonRun(scheduleId),
    getParticipationsForSchedule(scheduleId),
  ]);

  const plannedAttendCount = rows.filter(
    (row) => row.participation?.plannedStatus === "attend"
  ).length;
  const actualPresentCount = rows.filter(
    (row) => row.participation?.actualStatus === "present"
  ).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          길드 던전 기록 — {schedule.title}
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          {schedule.date} · 집결 {schedule.gatherTime ?? "-"} · 시작{" "}
          {schedule.startTime}
        </p>
        <p className="mt-1 text-sm text-ink-faint">
          참석 예정 {plannedAttendCount}명 · 실제 참석 {actualPresentCount}명
        </p>
      </div>

      <DungeonRunForm run={run} action={saveDungeonRun.bind(null, scheduleId)} />

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink">
          참여 체크
        </h2>
        <ParticipationTable scheduleId={scheduleId} rows={rows} />
      </div>
    </div>
  );
}
