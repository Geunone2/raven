"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Pin } from "lucide-react";
import { getNoticesPage, NoticeCategory, UnifiedNotice } from "@/lib/actions/notices";
import { Input } from "@/components/atoms/Input";
import { Badge } from "@/components/atoms/Badge";
import { SourceLabel } from "@/components/atoms/SourceLabel";
import { NewBadge } from "@/components/atoms/NewBadge";
import { isWithinLast24Hours } from "@/lib/time";

const CATEGORY_OPTIONS: { value: NoticeCategory; label: string }[] = [
  { value: "all", label: "전체" },
  { value: "leader", label: "리더공지" },
  { value: "notice", label: "포럼공지" },
  { value: "update", label: "업데이트" },
  { value: "devnote", label: "개발자노트" },
];

function formatDate(date: number) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function NoticeFeed({
  initialItems,
  initialHasMore,
}: {
  initialItems: UnifiedNotice[];
  initialHasMore: boolean;
}) {
  const [category, setCategory] = useState<NoticeCategory>("all");
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(initialItems);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const isFirstRun = useRef(true);

  useEffect(() => {
    const timeout = setTimeout(() => setQuery(queryInput.trim()), 300);
    return () => clearTimeout(timeout);
  }, [queryInput]);

  useEffect(() => {
    if (isFirstRun.current) {
      isFirstRun.current = false;
      return;
    }
    let cancelled = false;
    setLoading(true);
    getNoticesPage({ category, query, page: 1 }).then((result) => {
      if (cancelled) return;
      setItems(result.items);
      setHasMore(result.hasMore);
      setPage(1);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [category, query]);

  const loadMore = useCallback(() => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    getNoticesPage({ category, query, page: nextPage }).then((result) => {
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setPage(nextPage);
      setLoading(false);
    });
  }, [category, query, page, loading, hasMore]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Input
          value={queryInput}
          onChange={(e) => setQueryInput(e.target.value)}
          placeholder="검색어를 입력하세요"
          className="w-3/5"
        />
        <div className="flex flex-wrap gap-2">
          {CATEGORY_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setCategory(option.value)}
              className={`rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                category === option.value
                  ? "bg-brand text-white"
                  : "bg-surface-hover text-ink-muted hover:bg-edge"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        {items.length === 0 && !loading ? (
          <p className="py-12 text-center text-sm text-ink-faint">표시할 공지가 없습니다.</p>
        ) : (
          items.map((item) => (
            <div
              key={item.key}
              className={`flex gap-4 rounded-xl border p-4 shadow-md ${
                item.isPinned ? "border-brand/60 bg-brand/10" : "border-edge bg-surface"
              }`}
            >
              {item.imageUrl && (
                <Image
                  src={item.imageUrl}
                  alt=""
                  width={72}
                  height={72}
                  className="size-[72px] shrink-0 rounded-lg object-cover"
                />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <SourceLabel source={item.source} />
                  {item.isPinned && <Badge tone="warning">고정</Badge>}
                  <span className="ml-auto shrink-0 text-xs text-ink-faint">
                    {formatDate(item.date)}
                  </span>
                </div>
                <Link
                  href={`/notices/${item.key}`}
                  className="mt-2 flex items-center gap-1 font-medium text-ink hover:underline"
                >
                  {item.isPinned && <Pin className="size-3.5 shrink-0 text-brand" />}
                  {item.title}
                  {isWithinLast24Hours(item.date) && <NewBadge />}
                </Link>
              </div>
            </div>
          ))
        )}
      </div>

      <div ref={sentinelRef} className="h-1" />
      {loading && (
        <div className="flex justify-center py-2">
          <Loader2 className="size-5 animate-spin text-ink-faint" />
        </div>
      )}
    </div>
  );
}
