import { redirect } from "next/navigation";
import { getBankBalance, getBankBalancesWithBreakdown, getBankTransactions } from "@/lib/actions/bank";
import {
  getGuildTreasuryBalance,
  getGuildTreasuryTransactions,
  getTotalDistributedRewardPool,
} from "@/lib/actions/treasury";
import { getMemberPowerShare } from "@/lib/actions/members";
import { getContentParticipationStats, getContributionStats } from "@/lib/actions/scheduleCheckins";
import { getSessionMemberId } from "@/lib/auth/session";
import { BankViewToggle } from "@/components/organisms/BankViewToggle";

export default async function BankPage() {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const [
    balance,
    transactions,
    treasuryBalance,
    treasuryTransactions,
    memberBalances,
    participationStats,
    powerShare,
    totalRewardPool,
    ancientFortressStats,
    riftStats,
  ] = await Promise.all([
    getBankBalance(memberId),
    getBankTransactions(memberId),
    getGuildTreasuryBalance(),
    getGuildTreasuryTransactions(),
    getBankBalancesWithBreakdown(),
    getContributionStats(memberId),
    getMemberPowerShare(memberId),
    getTotalDistributedRewardPool(),
    getContentParticipationStats(memberId, "ancient_fortress"),
    getContentParticipationStats(memberId, "rift"),
  ]);

  const myBreakdown = memberBalances.find((row) => row.member.id === memberId);

  return (
    <BankViewToggle
      treasuryBalance={treasuryBalance}
      treasuryTransactions={treasuryTransactions}
      memberBalances={memberBalances}
      myBalance={balance}
      myDeposit={myBreakdown?.deposit ?? 0}
      myWithdrawal={myBreakdown?.withdrawal ?? 0}
      myTransactions={transactions}
      myPoints={participationStats.myPoints}
      totalPoints={participationStats.totalPoints}
      myPower={powerShare.myPower}
      totalPower={powerShare.totalPower}
      totalRewardPool={totalRewardPool}
      ancientFortressStats={ancientFortressStats}
      riftStats={riftStats}
    />
  );
}
