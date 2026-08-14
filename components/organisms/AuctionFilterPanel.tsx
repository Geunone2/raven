"use client";

import {useMemo, useState} from "react";
import {GuildMember, Loot, LootBid} from "@/lib/db/schema";
import {isAuctionEnded} from "@/lib/constants/loots";
import {GUILD_NAMES} from "@/lib/constants/members";
import {Button} from "@/components/atoms/Button";
import {Badge} from "@/components/atoms/Badge";
import {hashTone} from "@/lib/colorHash";
import {AuctionList} from "@/components/organisms/AuctionList";

type Filter = "open" | "ended" | "all";

const FILTER_LABELS: Record<Filter, string> = {
    open: "진행중인 목록",
    ended: "종료된 목록",
    all: "전체 목록",
};

const ALL_GUILDS = "전체";

export function AuctionFilterPanel({
                                       rows,
                                       myBids,
                                       bidsByLootId,
                                       myNickname,
                                   }: {
    rows: { loot: Loot }[];
    myBids: Map<number, number>;
    bidsByLootId: Map<number, { bid: LootBid; member: GuildMember }[]>;
    myNickname: string | null;
}) {
    const [filter, setFilter] = useState<Filter>("open");
    const [guildFilter, setGuildFilter] = useState(ALL_GUILDS);

    const filteredRows = useMemo(() => {
        const scoped = rows
            .filter(({loot}) =>
                filter === "all" ? true : filter === "open" ? !isAuctionEnded(loot) : isAuctionEnded(loot)
            )
            .filter(({loot}) => guildFilter === ALL_GUILDS || loot.custodyGuild === guildFilter);

        // 카운트다운이 가장 빠른(=마감이 가장 임박한) 순. 진행중인 경매를 먼저 두고, 그
        // 안에서 마감일 오름차순으로 정렬한다 — 그냥 마감일로만 정렬하면 한참 전에 이미
        // 끝난 경매가 날짜상 "가장 이르다"는 이유로 맨 위로 와버리기 때문이다. 마감일이
        // 없는 경매는 맨 뒤로 보낸다.
        return [...scoped].sort((a, b) => {
            const aEnded = isAuctionEnded(a.loot) ? 1 : 0;
            const bEnded = isAuctionEnded(b.loot) ? 1 : 0;
            if (aEnded !== bEnded) return aEnded - bEnded;

            const aTime = a.loot.bidDeadline ? new Date(a.loot.bidDeadline).getTime() : Infinity;
            const bTime = b.loot.bidDeadline ? new Date(b.loot.bidDeadline).getTime() : Infinity;
            return aTime - bTime;
        });
    }, [rows, filter, guildFilter]);

    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                {(Object.keys(FILTER_LABELS) as Filter[]).map((key) => (
                    <Button
                        key={key}
                        type="button"
                        size="lg"
                        variant={filter === key ? "primary" : "secondary"}
                        onClick={() => setFilter(key)}
                    >
                        {FILTER_LABELS[key]}
                    </Button>
                ))}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs text-ink-faint">길드</span>
                <button
                    type="button"
                    onClick={() => setGuildFilter(ALL_GUILDS)}
                    className={`rounded-full transition-shadow ${
                        guildFilter === ALL_GUILDS
                            ? "ring-2 ring-brand"
                            : "hover:ring-2 hover:ring-edge-strong"
                    }`}
                >
                    <Badge tone="neutral" size="lg">전체</Badge>
                </button>
                {GUILD_NAMES.map((guild) => (
                    <button
                        key={guild}
                        type="button"
                        onClick={() => setGuildFilter(guild)}
                        className={`rounded-full transition-shadow ${
                            guildFilter === guild ? "ring-2 ring-brand" : "hover:ring-2 hover:ring-edge-strong"
                        }`}
                    >
                        <Badge tone={hashTone(guild)} size="lg">{guild}</Badge>
                    </button>
                ))}
            </div>

            <AuctionList
                rows={filteredRows}
                myBids={myBids}
                bidsByLootId={bidsByLootId}
                myNickname={myNickname}
            />
        </div>
    );
}
