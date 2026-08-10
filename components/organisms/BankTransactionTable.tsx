import { BankTransaction } from "@/lib/db/schema";
import { bankTransactionTypeLabels } from "@/lib/constants/bank";
import { Badge } from "@/components/atoms/Badge";

const typeTone = {
  deposit: "success",
  withdrawal: "danger",
  adjustment: "neutral",
  loot_distribution: "success",
  auction_payment: "warning",
  content_reward: "info",
} as const;

export function BankTransactionTable({
  transactions,
}: {
  transactions: BankTransaction[];
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
            <th className="px-4 py-3 font-medium">메모</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-4 py-3 text-ink-faint">{tx.createdAt}</td>
              <td className="px-4 py-3">
                <Badge tone={typeTone[tx.type]}>{bankTransactionTypeLabels[tx.type]}</Badge>
              </td>
              <td
                className={`px-4 py-3 font-medium ${tx.amount < 0 ? "text-danger" : "text-success"}`}
              >
                {tx.amount > 0 ? "+" : ""}
                {tx.amount.toLocaleString()}
              </td>
              <td className="px-4 py-3 text-ink-faint">{tx.memo ?? "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
