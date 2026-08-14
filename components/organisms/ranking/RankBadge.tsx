const MEDAL_CLASSES: Record<number, string> = {
  1: "bg-medal-gold text-ink",
  2: "bg-medal-silver text-ink",
  3: "bg-medal-bronze text-ink",
};

export function RankBadge({ rank }: { rank: number }) {
  return (
    <span
      className={`flex size-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
        MEDAL_CLASSES[rank] ?? "bg-surface-sunken text-ink-muted"
      }`}
    >
      {rank}
    </span>
  );
}
