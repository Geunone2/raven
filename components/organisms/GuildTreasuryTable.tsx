import { GuildTreasuryTransaction } from "@/lib/db/schema";
import {
  guildTreasuryTransactionTypeLabels,
  guildTreasuryTransactionTypeTone,
} from "@/lib/constants/treasury";
import { Badge } from "@/components/atoms/Badge";
import { toEpochMs } from "@/lib/time";

// 지출 항목은 운영진이 직접 고른 날짜(YYYY-MM-DD, 시간 정보 없음)를 쓰고,
// 그 외 타입은 createdAt의 날짜 부분을 쓴다 — 시간은 어느 쪽이든 실제 생성
// 시각(createdAt)에서 가져와 항상 "YYYY-MM-DD HH:MM" 한 가지 형태로 보여준다.
function formatDateTime(tx: GuildTreasuryTransaction): string {
  const datePart = tx.date ?? tx.createdAt.slice(0, 10);
  const created = new Date(toEpochMs(tx.createdAt));
  const hours = String(created.getHours()).padStart(2, "0");
  const minutes = String(created.getMinutes()).padStart(2, "0");
  return `${datePart} ${hours}:${minutes}`;
}

export function GuildTreasuryTable({
  transactions,
}: {
  transactions: GuildTreasuryTransaction[];
}) {
  if (transactions.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        거래 내역이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">일시</th>
            <th className="px-4 py-3 font-medium">종류</th>
            <th className="px-4 py-3 font-medium">금액</th>
            <th className="px-4 py-3 font-medium">사유</th>
            <th className="px-4 py-3 font-medium">비고</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {transactions.map((tx) => (
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
              <td className="px-4 py-3 text-ink-faint">{tx.reason ?? "-"}</td>
              <td className="px-4 py-3 text-ink-faint">{tx.note ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
