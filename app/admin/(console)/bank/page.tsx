import { getBankBalances } from "@/lib/actions/bank";
import {
  getGuildTreasuryBalance,
  getGuildTreasuryTransactions,
  getUnsettledAuctionLoots,
} from "@/lib/actions/treasury";
import { getUnsettledContentRewardSchedules } from "@/lib/actions/contentRewards";
import { BankOverviewTable } from "@/components/organisms/BankOverviewTable";
import { GuildTreasuryTable } from "@/components/organisms/GuildTreasuryTable";
import { GuildExpenseForm } from "@/components/organisms/GuildExpenseForm";
import { UnsettledAuctionsPanel } from "@/components/organisms/UnsettledAuctionsPanel";
import { ContentRewardSettlementPanel } from "@/components/organisms/ContentRewardSettlementPanel";

export default async function BankOverviewPage() {
  const [rows, treasuryBalance, treasuryTransactions, unsettledLoots, unsettledContentRewards] =
    await Promise.all([
      getBankBalances(),
      getGuildTreasuryBalance(),
      getGuildTreasuryTransactions(),
      getUnsettledAuctionLoots(),
      getUnsettledContentRewardSchedules(),
    ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          통장 관리
        </h1>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-sm font-medium text-ink">길드 공용 통장</h2>
          <p className="mt-1 text-2xl font-semibold text-brand">
            {treasuryBalance.toLocaleString()}
            <span className="ml-1 text-sm font-medium text-ink-muted">크리스탈</span>
          </p>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-ink">정산 대기 중인 내판</h3>
          <UnsettledAuctionsPanel loots={unsettledLoots} />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-ink">정산 대기 중인 고대성채/쟁탈전</h3>
          <ContentRewardSettlementPanel schedules={unsettledContentRewards} />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-ink">지출 기록</h3>
          <GuildExpenseForm />
        </div>

        <div>
          <h3 className="mb-2 text-sm font-medium text-ink">길드 통장 거래 내역</h3>
          <GuildTreasuryTable transactions={treasuryTransactions} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-sm font-medium text-ink">길드원 개인 통장</h2>
        <BankOverviewTable rows={rows} />
      </section>
    </div>
  );
}
