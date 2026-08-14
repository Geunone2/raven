import Link from "next/link";
import { OfficialForumNotice } from "@/lib/actions/announcement/officialForum";
import { formatMonthDay, isWithinLast24Hours } from "@/lib/time";
import { NewBadge } from "@/components/atoms/NewBadge";
import { NoticeSource, SourceLabel } from "@/components/organisms/community/SourceLabel";

export type LabeledForumNotice = OfficialForumNotice & { source: NoticeSource };

export function ForumNoticesCard({ notices }: { notices: LabeledForumNotice[] }) {
  return (
    <div className="w-full min-h-70 max-h-70 overflow-hidden rounded-xl border border-edge bg-surface p-4 shadow-md">
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-brand">공식 포럼 소식</p>
        <Link href="/notices" className="text-xs text-ink-muted hover:underline">
          전체보기 &gt;
        </Link>
      </div>
      {notices.length === 0 ? (
        <p className="mt-4 text-sm text-ink-faint">공지를 불러올 수 없습니다.</p>
      ) : (
        <ul className="mt-4 space-y-3 text-sm">
          {notices.map((notice) => (
            <li key={`${notice.source}-${notice.id}`} className="flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1.5">
                <SourceLabel source={notice.source} />
                <a
                  href={notice.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="truncate hover:underline"
                >
                  {notice.title}
                  {isWithinLast24Hours(notice.regDate) && <NewBadge />}
                </a>
              </span>
              <span className="shrink-0 text-xs text-ink-faint">
                {formatMonthDay(notice.regDate)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
