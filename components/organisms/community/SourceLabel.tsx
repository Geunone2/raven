export type NoticeSource = "leader" | "notice" | "update" | "devnote";

const SOURCE_LABELS: Record<NoticeSource, string> = {
  leader: "리더공지",
  notice: "포럼공지",
  update: "업데이트",
  devnote: "개발자노트",
};

const SOURCE_CLASSES: Record<NoticeSource, string> = {
  leader: "bg-brand/15 text-brand",
  notice: "bg-surface-hover text-ink-muted",
  update: "bg-success/15 text-success",
  devnote: "bg-warning/15 text-warning",
};

export function SourceLabel({ source }: { source: NoticeSource }) {
  return (
    <span
      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${SOURCE_CLASSES[source]}`}
    >
      {SOURCE_LABELS[source]}
    </span>
  );
}
