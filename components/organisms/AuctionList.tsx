import { ContentSchedule, GuildMember, Loot, LootBid } from "@/lib/db/schema";
import {
  getAuctionWinner,
  getLeadingBidder,
  isAuctionEnded,
  isBidDeadlineImminent,
  lootCategoryLabels,
  lootCategoryTone,
  lootGradeLabels,
  lootGradeTone,
} from "@/lib/constants/loots";
import { hashTone } from "@/lib/colorHash";
import { Badge } from "@/components/atoms/Badge";
import { TimerIcon } from "@/components/atoms/TimerIcon";
import { LootBidCountdown } from "@/components/atoms/LootBidCountdown";
import { AuctionBidButtons } from "@/components/atoms/AuctionBidButtons";
import { ClosedStampIcon } from "@/components/atoms/ClosedStampIcon";

export function AuctionList({
  rows,
  myBids,
  bidsByLootId,
  myNickname,
}: {
  rows: { loot: Loot; schedule: ContentSchedule | null }[];
  myBids: Map<number, number>;
  bidsByLootId: Map<number, { bid: LootBid; member: GuildMember }[]>;
  myNickname: string | null;
}) {
  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        조건에 맞는 경매가 없습니다.
      </p>
    );
  }

  return (
    <ul className="space-y-3">
      {rows.map(({ loot }) => {
        const bids = bidsByLootId.get(loot.id) ?? [];
        const leadingBidder = getLeadingBidder(bids);
        const winner = getAuctionWinner(loot, bids);
        const ended = isAuctionEnded(loot);
        const imminent = isBidDeadlineImminent(loot);
        const hasMyBid = myBids.has(loot.id);
        const isMyWin = Boolean(ended && winner && myNickname && winner.nickname === myNickname);
        const isMyLoss = Boolean(ended && hasMyBid && !isMyWin);

        return (
          // 마감 스탬프(ClosedStampIcon)는 li가 아니라 이 안쪽 div에만 opacity/grayscale를
          // 걸어서 형제로 뺐다 — li에 그대로 걸면 스탬프까지 같이 흐려져서(마감 카드가
          // 회색 카드인데 그 위 스탬프까지 60% 불투명이 곱해짐) 도장 자체가 안 보이는
          // 문제가 있었다. li는 순수 포지셔닝 컨테이너로만 쓴다.
          <li key={loot.id} className="relative">
            <div
              className={`rounded-xl border bg-surface p-4 shadow-md transition-opacity ${
                imminent
                  ? "border-danger shadow-lg shadow-danger/50"
                  : ended
                    ? "border-edge opacity-60 grayscale-35"
                    : "border-edge"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone={lootGradeTone[loot.grade]}>{lootGradeLabels[loot.grade]}</Badge>
                    <Badge tone={lootCategoryTone[loot.category]}>
                      {lootCategoryLabels[loot.category]}
                    </Badge>
                    {imminent && <Badge tone="danger">마감임박</Badge>}
                    {isMyWin && <Badge tone="success">당첨</Badge>}
                    {isMyLoss && <Badge tone="neutral">미당첨</Badge>}
                  </div>
                  <p className="mt-1.5 text-lg font-semibold text-ink">{loot.itemName}</p>
                  <p className="mt-1 text-xs text-ink-faint">등록된 시간 {loot.obtainedAt}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-3 text-xs text-ink-muted">
                    <span>
                      보관 길드{" "}
                      {loot.custodyGuild ? (
                        <Badge tone={hashTone(loot.custodyGuild)}>{loot.custodyGuild}</Badge>
                      ) : (
                        "-"
                      )}
                    </span>
                    <span>
                      판매 금액{" "}
                      {loot.askingPrice != null
                        ? `${loot.askingPrice.toLocaleString()} 크리스탈`
                        : "-"}
                    </span>
                  </p>
                </div>
                {loot.bidDeadline && !ended && (
                  <span className="flex shrink-0 items-center gap-1 text-sm text-ink-muted">
                    <TimerIcon />
                    <LootBidCountdown bidDeadline={loot.bidDeadline} />
                  </span>
                )}
              </div>

              <div className="mt-3 flex items-center gap-2">
                <AuctionBidButtons lootId={loot.id} ended={ended} hasMyBid={hasMyBid} />
              </div>

              <div className="mt-3 flex text-sm items-center justify-between border-t border-edge pt-3 text-ink-muted">
                <span>
                  {ended ? "낙찰자ㅣ" : "입찰 유력ㅣ"}
                  <span className={`font-medium ${isMyWin ? "text-success" : "text-ink"}`}>
                    {ended
                      ? (winner ? winner.nickname : "-")
                      : (leadingBidder ? leadingBidder.nickname : "-")}
                  </span>
                </span>
                <span>입찰 인원 {bids.length}명</span>
              </div>
            </div>
            {ended && (
              <ClosedStampIcon className="absolute -top-2.5 -right-14 size-30 text-ink drop-shadow-md" />
            )}
          </li>
        );
      })}
    </ul>
  );
}
