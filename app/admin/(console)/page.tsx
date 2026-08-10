import Link from "next/link";
import { getMembers } from "@/lib/actions/members";
import { getAnnouncements } from "@/lib/actions/announcements";
import { getTodaySchedules } from "@/lib/actions/schedules";
import { contentTypeLabels } from "@/lib/constants/schedules";
import { countPendingLoots } from "@/lib/actions/loots";

export default async function DashboardPage() {
  const [members, announcements, todaySchedules, pendingLootCount] = await Promise.all([
    getMembers(),
    getAnnouncements(),
    getTodaySchedules(),
    countPendingLoots(),
  ]);
  const pinnedAnnouncements = announcements.filter((a) => a.isPinned);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold text-ink">
        대시보드
      </h1>
      <p className="text-sm text-ink-muted">
        현재 길드원 {members.length}명이 등록되어 있습니다.{" "}
        <Link href="/admin/members" className="underline">
          길드원 관리
        </Link>
        에서 목록을 확인하세요.
      </p>
      <p className="text-sm text-ink-muted">
        분배 대기 전리품{" "}
        <span className="font-semibold text-ink">
          {pendingLootCount}건
        </span>
        이 있습니다.{" "}
        <Link href="/admin/loots" className="underline">
          보상 분배
        </Link>
        에서 처리하세요.
      </p>
      <div className="rounded-md border border-edge p-4">
        <p className="text-sm font-medium text-ink">
          오늘의 일정
        </p>
        {todaySchedules.length === 0 ? (
          <p className="mt-2 text-sm text-ink-faint">오늘 예정된 콘텐츠가 없습니다.</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {todaySchedules.map((schedule) => (
              <li key={schedule.id} className="text-sm">
                <Link href={`/admin/schedules/${schedule.id}`} className="underline">
                  {schedule.startTime} {contentTypeLabels[schedule.type]} ·{" "}
                  {schedule.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {pinnedAnnouncements.length > 0 && (
        <div className="rounded-md border border-edge p-4">
          <p className="text-sm font-medium text-ink">
            고정 공지
          </p>
          <ul className="mt-2 space-y-1">
            {pinnedAnnouncements.map((announcement) => (
              <li key={announcement.id} className="text-sm">
                <Link
                  href={`/admin/announcements/${announcement.id}`}
                  className="underline"
                >
                  {announcement.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
