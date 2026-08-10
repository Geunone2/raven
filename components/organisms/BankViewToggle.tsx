"use client";

import { useState } from "react";
import { BankTransaction, GuildMember, GuildTreasuryTransaction } from "@/lib/db/schema";
import type { ContentParticipationStats } from "@/lib/actions/scheduleCheckins";
import { Button } from "@/components/atoms/Button";
import { BankTransactionTable } from "@/components/organisms/BankTransactionTable";
import { GuildTreasurySummaryCard } from "@/components/organisms/GuildTreasurySummaryCard";
import { MemberBankOverviewCard } from "@/components/organisms/MemberBankOverviewCard";
import { MyBankSummaryCard } from "@/components/organisms/MyBankSummaryCard";
import { SettlementCalculatorCarousel } from "@/components/organisms/SettlementCalculatorCarousel";

type View = "all" | "mine";

export function BankViewToggle({
  treasuryBalance,
  treasuryTransactions,
  memberBalances,
  myBalance,
  myDeposit,
  myWithdrawal,
  myTransactions,
  myPoints,
  totalPoints,
  myPower,
  totalPower,
  totalRewardPool,
  ancientFortressStats,
  riftStats,
}: {
  treasuryBalance: number;
  treasuryTransactions: GuildTreasuryTransaction[];
  memberBalances: { member: GuildMember; deposit: number; withdrawal: number; balance: number }[];
  myBalance: number;
  myDeposit: number;
  myWithdrawal: number;
  myTransactions: BankTransaction[];
  myPoints: number;
  totalPoints: number;
  myPower: number;
  totalPower: number;
  totalRewardPool: number;
  ancientFortressStats: ContentParticipationStats;
  riftStats: ContentParticipationStats;
}) {
  const [view, setView] = useState<View>("all");

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <Button
          type="button"
          size="lg"
          variant={view === "all" ? "primary" : "secondary"}
          onClick={() => setView("all")}
        >
          전체
        </Button>
        <Button
          type="button"
          size="lg"
          variant={view === "mine" ? "primary" : "secondary"}
          onClick={() => setView("mine")}
        >
          내 통장
        </Button>
      </div>

      {view === "all" ? (
        <div className="space-y-8">
          <GuildTreasurySummaryCard balance={treasuryBalance} transactions={treasuryTransactions} />
          <MemberBankOverviewCard rows={memberBalances} />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <MyBankSummaryCard balance={myBalance} deposit={myDeposit} withdrawal={myWithdrawal} />
            <SettlementCalculatorCarousel
              myPoints={myPoints}
              totalPoints={totalPoints}
              myPower={myPower}
              totalPower={totalPower}
              totalRewardPool={totalRewardPool}
              ancientFortressStats={ancientFortressStats}
              riftStats={riftStats}
            />
          </div>

          <BankTransactionTable transactions={myTransactions} />
        </div>
      )}
    </div>
  );
}
