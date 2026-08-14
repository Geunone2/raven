import { getLoots } from "@/lib/actions/loot/loots";
import { getUnsettledContentRewardSchedules } from "@/lib/actions/treasury/contentRewards";
import { LootFilterBar } from "@/components/organisms/loot/LootFilterBar";
import { LootTable } from "@/components/organisms/loot/LootTable";
import { ContentRewardSettlementPanel } from "@/components/organisms/treasury/ContentRewardSettlementPanel";
import { LootDistributionTabs } from "@/components/organisms/loot/LootDistributionTabs";

export default async function LootsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [rows, unsettledContentRewards] = await Promise.all([
    getLoots({ status }),
    getUnsettledContentRewardSchedules(),
  ]);

  // 정산 대기 목록은 한 번에 불러온 뒤 종류별로 나눠서 탭마다 다른 목록을 보여준다.
  const siegeSchedules = unsettledContentRewards.filter((schedule) => schedule.type === "siege");
  const ancientFortressSchedules = unsettledContentRewards.filter(
    (schedule) => schedule.type === "ancient_fortress"
  );

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        보상 분배
      </h1>
      <LootDistributionTabs
        auction={
          <div className="space-y-4">
            <LootFilterBar defaultStatus={status} />
            <LootTable rows={rows} />
          </div>
        }
        siege={
          <ContentRewardSettlementPanel
            schedules={siegeSchedules}
            emptyMessage="정산 대기 중인 쟁탈전 일정이 없습니다."
          />
        }
        ancientFortress={
          <ContentRewardSettlementPanel
            schedules={ancientFortressSchedules}
            emptyMessage="정산 대기 중인 고대성채 일정이 없습니다."
          />
        }
      />
    </div>
  );
}
