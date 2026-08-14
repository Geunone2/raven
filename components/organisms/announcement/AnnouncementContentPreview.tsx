"use client";

import { useEffect, useRef, useState } from "react";
import { looksLikeHtml, plainTextToHtml, RICH_TEXT_CLASS } from "@/lib/richText";

// 공지 목록에서 내용이 길면(2026-08-15) 4줄 높이만큼만 보여주고 아래를 흐릿하게
// 페이드아웃시킨다. Tiptap이 만든 HTML(문단/목록 등 블록 요소가 섞여 있음)에는
// line-clamp가 안정적으로 먹지 않아서, 고정 높이(max-h) + overflow-hidden으로
// 자른다. 마운트 후 실제 렌더된 높이(scrollHeight)가 그 높이(clientHeight)보다
// 큰 경우에만 페이드를 보여준다. 전체 내용은 "수정" 링크를 눌러 편집 페이지로
// 들어가면(RichTextEditor) 그대로 다 보인다.
export function AnnouncementContentPreview({ content }: { content: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setOverflowing(el.scrollHeight > el.clientHeight + 1);
  }, [content]);

  const html = looksLikeHtml(content) ? content : plainTextToHtml(content);

  return (
    <div className="relative mt-1">
      <div
        ref={ref}
        className={`max-h-24 overflow-hidden text-sm text-ink-muted ${RICH_TEXT_CLASS}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {overflowing && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-surface to-transparent" />
      )}
    </div>
  );
}
