import Image from "next/image";
import type { MemberRankPositions } from "@/lib/actions/members";
import {
  RANK_STAT_ACCENT_CLASSES,
  RANK_STAT_ICONS,
  RANK_STAT_LABELS,
  RankStat,
} from "@/lib/constants/members";

const STATS: RankStat[] = ["total", "attack", "defense", "accuracy"];

export function MemberRankCards({ positions }: { positions: MemberRankPositions }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {STATS.map((stat) => {
        const { value, guildRank, guildCount, totalRank, totalCount } = positions[stat];
        return (
          <div key={stat} className="rounded-xl border border-edge bg-surface p-4 shadow-md">
            <div className="flex items-center justify-between gap-3">
              <Image
                src={RANK_STAT_ICONS[stat]}
                alt=""
                width={48}
                height={48}
                className="size-12 shrink-0"
              />
              <div className="text-right">
                <p className="text-sm font-bold text-ink">{RANK_STAT_LABELS[stat]}</p>
                <p className={`text-2xl font-semibold ${RANK_STAT_ACCENT_CLASSES[stat]}`}>
                  {value.toLocaleString()}
                </p>
              </div>
            </div>
            <div className="mt-2 space-y-1 text-xs text-ink-faint">
              <div className="flex items-center justify-between">
                <span>길드</span>
                <span>
                  {guildRank}/{guildCount}위
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>전체</span>
                <span>
                  {totalRank}/{totalCount}위
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
