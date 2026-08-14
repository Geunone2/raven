import { redirect } from "next/navigation";
import { getAuctionLoots, getBidsForLoot, getMyBidAmounts } from "@/lib/actions/loot/loots";
import { getMember } from "@/lib/actions/member/members";
import { getSessionMemberId } from "@/lib/auth/session";
import { AuctionFilterPanel } from "@/components/organisms/loot/AuctionFilterPanel";

export default async function AuctionsPage() {
  const memberId = await getSessionMemberId();
  if (!memberId) {
    redirect("/login");
  }

  const rows = await getAuctionLoots();
  const [myBids, bidsPerLoot, self] = await Promise.all([
    getMyBidAmounts(
      memberId,
      rows.map((row) => row.loot.id)
    ),
    Promise.all(rows.map((row) => getBidsForLoot(row.loot.id))),
    getMember(memberId),
  ]);
  const bidsByLootId = new Map(rows.map((row, index) => [row.loot.id, bidsPerLoot[index]]));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          경매 참여
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          마감 시 입찰자 중 전투력이 가장 높은 사람이 자동으로 낙찰자로 확정됩니다. 운영진이
          필요 시 낙찰 결과를 직접 수정할 수 있습니다.
        </p>
      </div>
      <AuctionFilterPanel
        rows={rows}
        myBids={myBids}
        bidsByLootId={bidsByLootId}
        myNickname={self?.nickname ?? null}
      />
    </div>
  );
}
