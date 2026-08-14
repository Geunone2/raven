import Link from "next/link";
import { redirect } from "next/navigation";
import { getGuildTreasuryBalance, getGuildTreasuryTransactions } from "@/lib/actions/treasury/treasury";
import { getSessionMemberId } from "@/lib/auth/session";
import { TreasuryTable } from "@/components/organisms/treasury/TreasuryTable";
import { NetTreasuryChart } from "@/components/organisms/treasury/NetTreasuryChart";
import { TotalIcon } from "@/components/organisms/treasury/BankIcons";

export default async function BankAllPage() {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const [balance, transactions] = await Promise.all([
    getGuildTreasuryBalance(),
    getGuildTreasuryTransactions(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/bank" className="text-xs text-ink-muted hover:underline">
          &lt; 통장으로 돌아가기
        </Link>
        <h1 className="mt-2 flex items-center gap-2 text-xl font-semibold text-ink">
          <TotalIcon className="size-5 text-brand" />
          길드 공용 통장 - 전체 내역
        </h1>
        <p className="mt-1 text-2xl font-semibold text-brand">
          현재 보유금: {balance.toLocaleString()}
          <span className="ml-1 text-sm font-medium text-ink-muted">크리스탈</span>
        </p>
      </div>
      <NetTreasuryChart transactions={transactions} />
      <TreasuryTable transactions={transactions} />
    </div>
  );
}
