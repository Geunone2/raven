"use client";

import { useLiveNow } from "@/lib/hooks/useLiveNow";
import { formatRemainingTime } from "@/lib/time";
import { RouletteText } from "@/components/atoms/RouletteText";

export function LootBidCountdown({ bidDeadline }: { bidDeadline: string }) {
  const now = useLiveNow();
  if (!now) return <>계산 중...</>;
  return <RouletteText text={formatRemainingTime(bidDeadline, now)} />;
}
