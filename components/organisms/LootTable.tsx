"use client";

import { useState } from "react";
import Link from "next/link";
import { utils as xlsxUtils, writeFile as writeXlsxFile } from "xlsx";
import { Download } from "lucide-react";
import { Loot } from "@/lib/db/schema";
import {
  lootGradeLabels,
  lootCategoryLabels,
  distributionMethodLabels,
} from "@/lib/constants/loots";
import { distributionStatusLabels } from "@/lib/constants/dungeonRuns";
import { Badge } from "@/components/atoms/Badge";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { deleteLoot } from "@/lib/actions/loots";
import { toEpochMs, todayDateString } from "@/lib/time";

const statusTone = {
  undistributed: "warning",
  distributing: "neutral",
  completed: "success",
} as const;

const gradeTone = {
  rare: "neutral",
  hero: "success",
  legendary: "warning",
} as const;

const PAGE_SIZE = 10;

// 엑셀은 화면과 달리 나중에/다른 맥락에서 열어볼 수 있어서, 연도를 생략하는 화면용
// 포맷 대신 연도 포함 전체 날짜를 쓴다(MemberPanel.tsx의 동일 헬퍼와 같은 이유).
function formatFullDateTime(input: string): string {
  const date = new Date(toEpochMs(input));
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// 화면 표에서는 컬럼을 합쳐 보여주지만(아이템/거래 정보), 엑셀은 필드를 전부
// 펼쳐서 담는다 — note/settledAt/bidDeadline처럼 화면 표에 아예 없는 값도 포함.
function exportLootsToExcel(rows: { loot: Loot }[]) {
  const data = rows.map(({ loot }) => ({
    획득일: loot.obtainedAt,
    아이템명: loot.itemName,
    등급: lootGradeLabels[loot.grade],
    아이템정보: lootCategoryLabels[loot.category],
    분배방식: distributionMethodLabels[loot.distributionMethod],
    판매금액: loot.askingPrice ?? "",
    보관길드: loot.custodyGuild ?? "",
    입찰마감: loot.bidDeadline ?? "",
    최종수령자: loot.receiver ?? "",
    상태: distributionStatusLabels[loot.status],
    비고: loot.note ?? "",
    내판정산여부: loot.settledAt ? "정산완료" : "미정산",
    등록일시: formatFullDateTime(loot.createdAt),
  }));
  const sheet = xlsxUtils.json_to_sheet(data);
  const workbook = xlsxUtils.book_new();
  xlsxUtils.book_append_sheet(workbook, sheet, "보상분배");
  writeXlsxFile(workbook, `보상분배_${todayDateString()}.xlsx`);
}

export function LootTable({
  rows,
}: {
  rows: { loot: Loot }[];
}) {
  const [page, setPage] = useState(1);
  const [queryInput, setQueryInput] = useState("");
  const [query, setQuery] = useState("");

  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        등록된 전리품이 없습니다.
      </p>
    );
  }

  // 아이템명으로만 검색 — 획득자 칼럼을 없앤 뒤로는 아이템명이 가장 먼저
  // 찾아보는 값이라 검색 범위를 넓히지 않고 단순하게 둔다.
  const filtered = query.trim()
    ? rows.filter(({ loot }) =>
        loot.itemName.toLowerCase().includes(query.trim().toLowerCase())
      )
    : rows;

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <form
          className="flex flex-nowrap gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            setQuery(queryInput);
            setPage(1);
          }}
        >
          <div className="min-w-0 max-w-xs flex-1">
            <Input
              type="text"
              placeholder="아이템명으로 검색"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary" className="shrink-0 whitespace-nowrap">
            검색
          </Button>
        </form>

        <Button
          type="button"
          variant="secondary"
          className="shrink-0 whitespace-nowrap"
          onClick={() => exportLootsToExcel(filtered)}
        >
          <Download className="mr-1.5 inline size-4" />
          엑셀로 내보내기
        </Button>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-ink-faint">
          검색 결과가 없습니다.
        </p>
      ) : (
        <>
          <div className="overflow-x-auto rounded-md border border-edge">
            {/* 태블릿/모바일에서는 부가 정보 칼럼(획득일/분배 방식/거래 정보)을
                숨겨서 가로 스크롤을 최소화한다(2026-08-14) — 아이템/상태/수정·삭제만
                항상 보이면 화면이 깨지지 않는다. min-w도 그때그때 보이는 칼럼
                수만큼만 요구하도록 브레이크포인트별로 줄인다. */}
            <table className="w-full min-w-[420px] text-left text-sm md:min-w-[620px] xl:min-w-[800px]">
              <thead className="bg-surface-raised text-ink-faint">
                <tr>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">획득일</th>
                  <th className="px-4 py-3 font-medium">아이템</th>
                  <th className="hidden px-4 py-3 font-medium md:table-cell">분배 방식</th>
                  <th className="hidden px-4 py-3 font-medium xl:table-cell">거래 정보</th>
                  <th className="px-4 py-3 font-medium">상태</th>
                  <th className="px-4 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-edge">
                {paged.map(({ loot }) => (
                  <tr key={loot.id}>
                    <td className="hidden px-4 py-3 font-medium text-ink md:table-cell">
                      {loot.obtainedAt}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-ink">{loot.itemName}</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <Badge tone={gradeTone[loot.grade]} size="sm">
                          {lootGradeLabels[loot.grade]}
                        </Badge>
                        <span className="text-xs text-ink-faint">
                          {lootCategoryLabels[loot.category]}
                        </span>
                        {/* md 미만에서만 획득일을 아이템 칼럼 아래에 같이 보여준다 —
                            칼럼 자체는 숨기지만 정보는 잃지 않게 하기 위함. */}
                        <span className="text-xs text-ink-faint md:hidden">
                          · {loot.obtainedAt}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-ink-faint md:table-cell">
                      {distributionMethodLabels[loot.distributionMethod]}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-ink-faint xl:table-cell">
                      <p>
                        판매{" "}
                        {loot.askingPrice != null ? loot.askingPrice.toLocaleString() : "-"}
                      </p>
                      <p>보관 {loot.custodyGuild ?? "-"}</p>
                      <p>수령 {loot.receiver ?? "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <Badge tone={statusTone[loot.status]}>
                        {distributionStatusLabels[loot.status]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/loots/${loot.id}`}
                          className="text-sm text-ink-muted hover:underline"
                        >
                          수정
                        </Link>
                        <form action={deleteLoot.bind(null, loot.id)}>
                          <button
                            type="submit"
                            className="text-sm text-danger hover:underline"
                          >
                            삭제
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pageCount > 1 && (
            <div className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="secondary"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
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
                onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              >
                다음
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
