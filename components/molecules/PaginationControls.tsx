"use client";

import { Button } from "@/components/atoms/Button";

// usePagination과 짝을 이루는 "이전/다음" 버튼 UI — 여러 표·목록 컴포넌트에
// 바이트 단위로 동일하게 중복돼 있던 JSX를 하나로 뺐다(2026-08-15).
export function PaginationControls({
  currentPage,
  pageCount,
  onChange,
}: {
  currentPage: number;
  pageCount: number;
  onChange: (page: number) => void;
}) {
  if (pageCount <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      <Button
        type="button"
        variant="secondary"
        disabled={currentPage <= 1}
        onClick={() => onChange(Math.max(1, currentPage - 1))}
      >
        이전
      </Button>
      <span className="text-sm text-ink-muted">
        {currentPage} / {pageCount}
      </span>
      <Button
        type="button"
        variant="secondary"
        disabled={currentPage >= pageCount}
        onClick={() => onChange(Math.min(pageCount, currentPage + 1))}
      >
        다음
      </Button>
    </div>
  );
}
