import { getBankBalances } from "@/lib/actions/bank";
import {
  getGuildTreasuryBalance,
  getGuildTreasuryTransactions,
  getUnsettledAuctionLoots,
} from "@/lib/actions/treasury";
import { BankOverviewTable } from "@/components/organisms/BankOverviewTable";
import { GuildTreasuryTable } from "@/components/organisms/GuildTreasuryTable";
import { GuildTreasurySummaryCard } from "@/components/organisms/GuildTreasurySummaryCard";
import { GuildTransactionForm } from "@/components/organisms/GuildTransactionForm";
import { UnsettledAuctionsPanel } from "@/components/organisms/UnsettledAuctionsPanel";
import { BankManagementTabs } from "@/components/organisms/BankManagementTabs";

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

      <GuildTreasurySummaryCard
        balance={treasuryBalance}
        transactions={treasuryTransactions}
        showLinks={false}
        showRecent={false}
      />

      <BankManagementTabs
        unsettled={<UnsettledAuctionsPanel loots={unsettledLoots} />}
        manual={<GuildTransactionForm />}
        treasury={<GuildTreasuryTable transactions={treasuryTransactions} />}
        members={<BankOverviewTable rows={rows} />}
      />
    </div>
  );
}
