import { notFound } from "next/navigation";
import { getBidsForLoot, getLoot, updateLoot } from "@/lib/actions/loot/loots";
import { LootForm } from "@/components/organisms/loot/LootForm";
import { AuctionBidList } from "@/components/organisms/loot/AuctionBidList";

export default async function EditLootPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const loot = await getLoot(Number(id));

  if (!loot) {
    notFound();
  }

  const bids = loot.distributionMethod === "auction" ? await getBidsForLoot(loot.id) : [];

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          전리품 수정
        </h1>
        <LootForm loot={loot} action={updateLoot.bind(null, loot.id)} />
      </div>
      {loot.distributionMethod === "auction" && (
        <AuctionBidList loot={loot} bids={bids} />
      )}
    </div>
  );
}
