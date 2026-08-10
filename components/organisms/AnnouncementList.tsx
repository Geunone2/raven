import Link from "next/link";
import { Announcement } from "@/lib/db/schema";
import { announcementCategoryLabels } from "@/lib/constants/announcements";
import { Badge } from "@/components/atoms/Badge";
import { deleteAnnouncement } from "@/lib/actions/announcements";

export function AnnouncementList({
  announcements,
  readOnly = false,
}: {
  announcements: Announcement[];
  readOnly?: boolean;
}) {
  if (announcements.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        등록된 공지가 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {announcements.map((announcement) => (
        <li
          key={announcement.id}
          className="rounded-md border border-edge p-4"
        >
          <div className="flex items-center gap-2">
            {announcement.isPinned && <Badge tone="warning">고정</Badge>}
            <Badge>{announcementCategoryLabels[announcement.category]}</Badge>
            <span className="text-xs text-ink-faint">
              {announcement.createdAt.slice(0, 16)}
            </span>
          </div>
          <h2 className="mt-2 font-medium text-ink">
            {announcement.title}
          </h2>
          <p className="mt-1 whitespace-pre-wrap text-sm text-ink-muted">
            {announcement.content}
          </p>
          {!readOnly && (
            <div className="mt-3 flex items-center justify-end gap-3">
              <Link
                href={`/admin/announcements/${announcement.id}`}
                className="text-sm text-ink-muted hover:underline"
              >
                수정
              </Link>
              <form action={deleteAnnouncement.bind(null, announcement.id)}>
                <button
                  type="submit"
                  className="text-sm text-danger hover:underline"
                >
                  삭제
                </button>
              </form>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
