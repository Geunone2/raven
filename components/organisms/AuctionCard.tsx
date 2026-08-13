"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ContentSchedule, GuildMember, Loot, LootBid } from "@/lib/db/schema";
import {
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

export function AuctionCard({
  rows,
  myBids,
  bidsByLootId,
}: {
  rows: { loot: Loot; schedule: ContentSchedule | null }[];
  myBids: Map<number, number>;
  bidsByLootId: Map<number, { bid: LootBid; member: GuildMember }[]>;
}) {
  const [autoplayPlugin] = useState(() =>
    Autoplay({ delay: 4000, stopOnInteraction: false })
  );
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: rows.length > 1 },
    rows.length > 1 ? [autoplayPlugin] : []
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelectedIndex(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md min-h-79">
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-brand">경매 (내판)</p>
        <Link href="/auctions" className="text-xs text-ink-muted hover:underline">
          전체보기 &gt;
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="mt-6 text-sm text-ink-faint">진행 중인 경매가 없습니다.</p>
      ) : (
        <>
          <div className="mt-6 overflow-hidden" ref={emblaRef}>
            <div className="flex">
              {rows.map(({ loot }) => {
                const bids = bidsByLootId.get(loot.id) ?? [];
                const leadingBidder = getLeadingBidder(bids);
                const ended = isAuctionEnded(loot);
                const imminent = isBidDeadlineImminent(loot);
                const hasMyBid = myBids.has(loot.id);

                return (
                  <div key={loot.id} className="min-w-0 shrink-0 grow-0 basis-full">
                    <div
                      className={`relative rounded-md border p-3 text-xs ${
                        imminent
                          ? "border-danger shadow-md shadow-danger/50"
                          : ended
                            ? "border-edge opacity-60 grayscale-[35%]"
                            : "border-edge"
                      }`}
                    >
                      {ended && (
                        <ClosedStampIcon className="absolute -top-2 -right-2 size-6 text-ink-faint drop-shadow-md" />
                      )}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Badge tone={lootGradeTone[loot.grade]}>
                          {lootGradeLabels[loot.grade]}
                        </Badge>
                        <Badge tone={lootCategoryTone[loot.category]}>
                          {lootCategoryLabels[loot.category]}
                        </Badge>
                        <Badge tone={loot.custodyGuild ? hashTone(loot.custodyGuild) : "neutral"}>
                          {loot.custodyGuild ?? "-"}
                        </Badge>
                        {imminent && <Badge tone="danger">마감임박</Badge>}
                      </div>

                      <div className="mt-2 flex items-start justify-between gap-2">
                        <p className="truncate text-lg font-medium text-ink">{loot.itemName}</p>
                        {loot.bidDeadline && !ended && (
                          <span className="flex shrink-0 items-center gap-1 text-ink-muted">
                            <TimerIcon />
                            <LootBidCountdown bidDeadline={loot.bidDeadline} />
                          </span>
                        )}
                      </div>

                      <p className="mt-1 text-ink-muted">
                        판매 금액{" "}
                        {loot.askingPrice != null
                          ? `${loot.askingPrice.toLocaleString()} 크리스탈`
                          : "-"}
                      </p>

                      <div className="mt-1 text-sm flex items-center justify-between text-ink-muted">
                        <span>입찰 유력: {leadingBidder ? leadingBidder.nickname : "-"}</span>
                        <span>입찰 인원: {bids.length}명</span>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <AuctionBidButtons
                          lootId={loot.id}
                          ended={ended}
                          hasMyBid={hasMyBid}
                          fullWidth
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {rows.length > 1 && (
            <div className="mt-3 flex items-center justify-center gap-1.5">
              {rows.map(({ loot }, index) => (
                <button
                  key={loot.id}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(index)}
                  aria-label={`${index + 1}번째 경매로 이동`}
                  className={`size-1.5 rounded-full transition-colors ${
                    index === selectedIndex ? "bg-brand" : "bg-edge-strong"
                  }`}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
