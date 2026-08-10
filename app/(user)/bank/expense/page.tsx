import Link from "next/link";
import { redirect } from "next/navigation";
import { getGuildTreasuryTransactions } from "@/lib/actions/treasury";
import { getSessionMemberId } from "@/lib/auth/session";
import { GuildTreasuryTable } from "@/components/organisms/GuildTreasuryTable";
import { TreasuryTransactionChart } from "@/components/organisms/TreasuryTransactionChart";
import { ExpenseIcon } from "@/components/atoms/BankIcons";

export default async function BankExpensePage() {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const transactions = await getGuildTreasuryTransactions();
  const expense = transactions.filter((tx) => tx.amount < 0);
  const expenseTotal = expense.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/bank" className="text-xs text-ink-muted hover:underline">
          &lt; 통장으로 돌아가기
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-xl font-semibold text-ink">
          <ExpenseIcon className="size-5 text-danger" />
          길드 공용 통장 - 지출 내역
        </h1>
        <p className="mt-1 text-2xl font-semibold text-danger">
          총 지출: {expenseTotal.toLocaleString()}
          <span className="ml-1 text-sm font-medium text-ink-muted">크리스탈</span>
        </p>
      </div>
      <TreasuryTransactionChart transactions={expense} color="danger" />
      <GuildTreasuryTable transactions={expense} />
    </div>
  );
}
