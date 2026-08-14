import { getBankBalances } from "@/lib/actions/treasury/bank";
import {
  getGuildTreasuryBalance,
  getGuildTreasuryTransactions,
  getUnsettledAuctionLoots,
} from "@/lib/actions/treasury/treasury";
import { BankOverviewTable } from "@/components/organisms/treasury/BankOverviewTable";
import { TreasuryTable } from "@/components/organisms/treasury/TreasuryTable";
import { TreasurySummaryCard } from "@/components/organisms/treasury/TreasurySummaryCard";
import { TreasuryTransactionForm } from "@/components/organisms/treasury/TreasuryTransactionForm";
import { UnsettledAuctionsPanel } from "@/components/organisms/treasury/UnsettledAuctionsPanel";
import { BankManagementTabs } from "@/components/organisms/treasury/BankManagementTabs";

export default async function BankOverviewPage() {
  const [rows, treasuryBalance, treasuryTransactions, unsettledLoots] = await Promise.all([
    getBankBalances(),
    getGuildTreasuryBalance(),
    getGuildTreasuryTransactions(),
    getUnsettledAuctionLoots(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">통장 관리</h1>

      <TreasurySummaryCard
        balance={treasuryBalance}
        transactions={treasuryTransactions}
        showLinks={false}
        showRecent={false}
      />

      <BankManagementTabs
        unsettled={<UnsettledAuctionsPanel loots={unsettledLoots} />}
        manual={<TreasuryTransactionForm />}
        treasury={<TreasuryTable transactions={treasuryTransactions} />}
        members={<BankOverviewTable rows={rows} />}
      />
    </div>
  );
}
