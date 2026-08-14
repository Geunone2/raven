import Link from "next/link";
import { redirect } from "next/navigation";
import { getGuildTreasuryTransactions } from "@/lib/actions/treasury/treasury";
import { getSessionMemberId } from "@/lib/auth/session";
import { TreasuryTable } from "@/components/organisms/treasury/TreasuryTable";
import { TreasuryTransactionChart } from "@/components/organisms/treasury/TreasuryTransactionChart";
import { IncomeIcon } from "@/components/organisms/treasury/BankIcons";

export default async function BankIncomePage() {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const transactions = await getGuildTreasuryTransactions();
  const income = transactions.filter((tx) => tx.amount > 0);
  const incomeTotal = income.reduce((sum, tx) => sum + tx.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/bank" className="text-xs text-ink-muted hover:underline">
          &lt; 통장으로 돌아가기
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-xl font-semibold text-ink">
          <IncomeIcon className="size-5 text-success" />
          길드 공용 통장 - 수입 내역
        </h1>
        <p className="mt-1 text-2xl font-semibold text-success">
          총 수입: {incomeTotal.toLocaleString()}
          <span className="ml-1 text-sm font-medium text-ink-muted">크리스탈</span>
        </p>
      </div>
      <TreasuryTransactionChart transactions={income} color="success" />
      <TreasuryTable transactions={income} />
    </div>
  );
}
