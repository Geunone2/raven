"use client";

import { useState } from "react";

// LootTable/BankTransactionTable/TreasuryTable/ScheduleCardList 등 여러
// 표·목록 컴포넌트에 거의 동일한 형태로 중복돼 있던 클라이언트 사이드 페이지네이션
// 상태 로직을 하나로 뺐다(2026-08-15). items가 바뀌어도(검색/필터 등) page는
// 그대로 유지되지만, currentPage가 pageCount로 clamp되어 범위를 벗어나지 않는다.
export function usePagination<T>(items: T[], pageSize: number) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const paged = items.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  return { page, setPage, pageCount, currentPage, paged };
}
