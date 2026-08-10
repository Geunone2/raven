import { GuildMember, Loot, LootBid } from "@/lib/db/schema";
import { Button } from "@/components/atoms/Button";
import { awardAuction } from "@/lib/actions/loots";

export function AuctionBidList({
  loot,
  bids,
}: {
  loot: Loot;
  bids: { bid: LootBid; member: GuildMember }[];
}) {
  return (
    <div className="space-y-3">
      <h2 className="text-sm font-medium text-ink">
        입찰 현황
      </h2>
      {bids.length === 0 ? (
        <p className="text-sm text-ink-faint">아직 입찰이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {bids.map(({ bid, member }) => (
            <li
              key={bid.id}
              className="flex items-center justify-between rounded-md border border-edge px-4 py-2"
            >
              <span className="text-sm text-ink">
                {member.nickname}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-ink-faint">{bid.amount}</span>
                {loot.status !== "completed" && (
                  <form action={awardAuction.bind(null, loot.id, member.id)}>
                    <Button type="submit" variant="secondary" className="px-3 py-1.5 text-xs">
                      낙찰자로 확정
                    </Button>
                  </form>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
