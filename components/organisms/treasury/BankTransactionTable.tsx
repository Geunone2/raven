"use client";

import { BankTransaction } from "@/lib/db/schema";
import { bankTransactionTypeLabels, bankTransactionTypeTone } from "@/lib/constants/treasury/bank";
import { Badge } from "@/components/atoms/Badge";
import { PaginationControls } from "@/components/molecules/PaginationControls";
import { usePagination } from "@/lib/hooks/usePagination";

const PAGE_SIZE = 10;

export function BankTransactionTable({
  transactions,
}: {
  transactions: BankTransaction[];
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
        {/* 메모는 태블릿부터만 보여준다(2026-08-14) — 일시/종류/금액만 있으면
            화면이 깨지지 않는다. */}
        <table className="w-full min-w-[420px] text-left text-sm md:min-w-[700px]">
          <thead className="bg-surface-raised text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">일시</th>
              <th className="px-4 py-3 font-medium">종류</th>
              <th className="px-4 py-3 font-medium">금액</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">메모</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {paged.map((tx) => (
              <tr key={tx.id}>
                <td className="px-4 py-3 text-ink-faint">{tx.createdAt}</td>
                <td className="px-4 py-3">
                  <Badge tone={bankTransactionTypeTone[tx.type]}>
                    {bankTransactionTypeLabels[tx.type]}
                  </Badge>
                </td>
                <td
                  className={`px-4 py-3 font-medium ${tx.amount < 0 ? "text-danger" : "text-success"}`}
                >
                  {tx.amount > 0 ? "+" : ""}
                  {tx.amount.toLocaleString()}
                </td>
                <td className="hidden px-4 py-3 text-ink-faint md:table-cell">{tx.memo ?? "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PaginationControls currentPage={currentPage} pageCount={pageCount} onChange={setPage} />
    </div>
  );
}
