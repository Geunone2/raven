import { redirect } from "next/navigation";
import { getMember } from "@/lib/actions/member/members";
import { getSchedulesForCheckin } from "@/lib/actions/schedule/schedules";
import {
  getContributionStats,
  getMyScheduleCheckins,
  getScheduleCheckinRoster,
} from "@/lib/actions/schedule/scheduleCheckins";
import { getSessionMemberId } from "@/lib/auth/session";
import { AttendanceCheckinPanel } from "@/components/organisms/schedule/AttendanceCheckinPanel";
import { AttendanceScoreGuideCard } from "@/components/organisms/schedule/AttendanceScoreGuideCard";
import { MyContributionCard } from "@/components/organisms/member/MyContributionCard";

export default async function AttendancePage() {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const [self, schedules, contributionStats] = await Promise.all([
    getMember(memberId),
    getSchedulesForCheckin(),
    getContributionStats(memberId),
  ]);
  const scheduleIds = schedules.map((schedule) => schedule.id);
  const [myCheckinByScheduleId, rosterByScheduleId] = await Promise.all([
    getMyScheduleCheckins(memberId, scheduleIds),
    getScheduleCheckinRoster(scheduleIds),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          출석 체크
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          진행 중인 콘텐츠에 출석 여부를 등록하세요. 일정 시작 후 6시간까지만 응답할 수 있어요.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <AttendanceScoreGuideCard />
        <MyContributionCard {...contributionStats} />
      </div>

      <AttendanceCheckinPanel
        schedules={schedules}
        myCheckinByScheduleId={myCheckinByScheduleId}
        myServer={self?.server ?? null}
        rosterByScheduleId={rosterByScheduleId}
      />
    </div>
  );
}
