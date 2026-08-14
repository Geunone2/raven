import { Loot } from "@/lib/db/schema";
import { settleLootSale } from "@/lib/actions/treasury/treasury";
import { Button } from "@/components/atoms/Button";

export function UnsettledAuctionsPanel({ loots }: { loots: Loot[] }) {
  if (loots.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-faint">
        정산 대기 중인 내판 건이 없습니다.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-edge rounded-md border border-edge">
      {loots.map((loot) => (
        <li key={loot.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          <div>
            <p className="font-medium text-ink">{loot.itemName}</p>
            <p className="text-ink-faint">
              판매 금액 {loot.askingPrice?.toLocaleString() ?? "-"} 크리스탈 · 보관 길드{" "}
              {loot.custodyGuild ?? "-"}
            </p>
          </div>
          <form action={settleLootSale.bind(null, loot.id)}>
            <Button type="submit" size="md">
              정산 실행
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
