"use client";

import { GuildTreasuryTransaction } from "@/lib/db/schema";
import {
  guildTreasuryTransactionTypeLabels,
  guildTreasuryTransactionTypeTone,
} from "@/lib/constants/treasury/treasury";
import { Badge } from "@/components/atoms/Badge";
import { PaginationControls } from "@/components/molecules/PaginationControls";
import { usePagination } from "@/lib/hooks/usePagination";
import { formatDateTimeMinute } from "@/lib/time";

const PAGE_SIZE = 10;

// 지출 항목은 운영진이 직접 고른 날짜(YYYY-MM-DD, 시간 정보 없음)를 쓰고,
// 그 외 타입은 createdAt의 날짜 부분을 쓴다 — 시간은 어느 쪽이든 실제 생성
// 시각(createdAt)에서 가져와 항상 "YYYY-MM-DD HH:MM" 한 가지 형태로 보여준다.
// createdAt은 KST로 변환해서 시:분을 뽑는다 — 예전엔 UTC 문자열을 그냥 자르거나
// (tx.date 없는 경우 날짜 부분) 로컬 getter를 써서(시:분 부분), 서버(UTC)와
// 브라우저(KST) 렌더 결과가 달라 하이드레이션 불일치가 났었다(2026-08-15 수정).
function formatDateTime(tx: GuildTreasuryTransaction): string {
  const full = formatDateTimeMinute(tx.createdAt);
  if (tx.date) return `${tx.date} ${full.slice(11)}`;
  return full;
}

export function TreasuryTable({
  transactions,
}: {
  transactions: GuildTreasuryTransaction[];
}) {
  const { setPage, pageCount, currentPage, paged } = usePagination(transactions, PAGE_SIZE);

  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        거래 내역이 없습니다.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-md border border-edge">
        {/* 사유는 태블릿부터, 비고는 PC부터만 보여준다(2026-08-14) — 일시/종류/
            금액만 있으면 화면이 깨지지 않는다. */}
        <table className="w-full min-w-[420px] text-left text-sm md:min-w-[560px] xl:min-w-[700px]">
          <thead className="bg-surface-raised text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">일시</th>
              <th className="px-4 py-3 font-medium">종류</th>
              <th className="px-4 py-3 font-medium">금액</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">사유</th>
              <th className="hidden px-4 py-3 font-medium xl:table-cell">비고</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {paged.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-3 text-ink-faint">{formatDateTime(tx)}</td>
                <td className="px-4 py-3">
                  <Badge tone={guildTreasuryTransactionTypeTone[tx.type]}>
                    {guildTreasuryTransactionTypeLabels[tx.type]}
                  </Badge>
                </td>
                <td
                  className={`px-4 py-3 font-medium ${tx.amount < 0 ? "text-danger" : "text-success"}`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount.toLocaleString()}
                </td>
                <td className="hidden px-4 py-3 text-ink-faint md:table-cell">{tx.reason ?? "-"}</td>
                <td className="hidden px-4 py-3 text-ink-faint xl:table-cell">{tx.note ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls currentPage={currentPage} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
