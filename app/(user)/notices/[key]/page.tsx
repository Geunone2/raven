import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink } from "lucide-react";
import { getNoticeDetail } from "@/lib/actions/notices";
import { SourceLabel } from "@/components/atoms/SourceLabel";
import { Badge } from "@/components/atoms/Badge";
import { RICH_TEXT_CLASS } from "@/lib/richText";

const buttonClass =
  "inline-flex items-center gap-2 rounded-xl border border-edge bg-surface px-4 py-2.5 text-base text-ink-muted shadow-md hover:bg-surface-hover";

function formatDate(date: number) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default async function NoticeDetailPage({
  params,
}: {
  params: Promise<{ key: string }>;
}) {
  const { key } = await params;
  const notice = await getNoticeDetail(key);

  if (!notice) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/notices" className={buttonClass}>
          <ArrowLeft className="size-5" />
          목록
        </Link>
        {notice.originalUrl && (
          <a
            href={notice.originalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass}
          >
            <ExternalLink className="size-5" />
            원본보기
          </a>
        )}
      </div>

      <div className="rounded-xl border border-edge bg-surface p-6 shadow-md">
        <div className="flex items-center gap-2">
          <SourceLabel source={notice.source} />
          {notice.isPinned && <Badge tone="warning">고정</Badge>}
          <span className="ml-auto shrink-0 text-xs text-ink-faint">
            {formatDate(notice.date)}
          </span>
        </div>

        <h1 className="mt-3 text-xl font-semibold text-ink">{notice.title}</h1>

        <div className="mt-4 border-t border-edge pt-4">
          {notice.isHtml ? (
            <div
              className={`text-sm text-ink [&_img]:max-w-full [&_p]:my-2! **:leading-relaxed! ${RICH_TEXT_CLASS}`}
              dangerouslySetInnerHTML={{ __html: notice.content }}
            />
          ) : (
            <p className="whitespace-pre-wrap text-sm text-ink-muted">{notice.content}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {notice.older ? (
          <Link
            href={`/notices/${notice.older.key}`}
            className="rounded-xl border border-edge bg-surface p-4 shadow-md hover:bg-surface-hover"
          >
            <p className="flex items-center gap-1.5 text-xs text-ink-faint">
              <ArrowLeft className="size-3.5" />
              이전 공지사항
            </p>
            <p className="mt-1 truncate text-sm font-medium text-ink">{notice.older.title}</p>
          </Link>
        ) : (
          <div />
        )}
        {notice.newer ? (
          <Link
            href={`/notices/${notice.newer.key}`}
            className="rounded-xl border border-edge bg-surface p-4 text-right shadow-md hover:bg-surface-hover"
          >
            <p className="flex items-center justify-end gap-1.5 text-xs text-ink-faint">
              이후 공지사항
              <ArrowRight className="size-3.5" />
            </p>
            <p className="mt-1 truncate text-sm font-medium text-ink">{notice.newer.title}</p>
          </Link>
        ) : (
          <div />
        )}
      </div>
    </div>
  );
}
