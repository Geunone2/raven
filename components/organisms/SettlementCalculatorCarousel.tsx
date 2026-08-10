"use client";

import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ContentParticipationStats } from "@/lib/actions/scheduleCheckins";
import { SettlementEstimatorCard } from "@/components/organisms/SettlementEstimatorCard";
import { ContentRewardEstimatorCard } from "@/components/organisms/ContentRewardEstimatorCard";

export function SettlementCalculatorCarousel({
  myPoints,
  totalPoints,
  myPower,
  totalPower,
  totalRewardPool,
  ancientFortressStats,
  riftStats,
}: {
  myPoints: number;
  totalPoints: number;
  myPower: number;
  totalPower: number;
  totalRewardPool: number;
  ancientFortressStats: ContentParticipationStats;
  riftStats: ContentParticipationStats;
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
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

  const slides = [
    <SettlementEstimatorCard
      key="loot"
      myPoints={myPoints}
      totalPoints={totalPoints}
      myPower={myPower}
      totalPower={totalPower}
      totalRewardPool={totalRewardPool}
    />,
    <ContentRewardEstimatorCard
      key="ancient_fortress"
      title="고대성채"
      myPower={ancientFortressStats.myPower}
      totalPower={ancientFortressStats.totalPower}
      myScore={ancientFortressStats.myScore}
      totalScore={ancientFortressStats.totalScore}
    />,
    <ContentRewardEstimatorCard
      key="rift"
      title="쟁탈전"
      myPower={riftStats.myPower}
      totalPower={riftStats.totalPower}
      myScore={riftStats.myScore}
      totalScore={riftStats.totalScore}
    />,
  ];

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-ink-muted">
          정산 계산기 ({selectedIndex + 1}/{slides.length})
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="이전 계산기"
            className="flex size-8 items-center justify-center rounded-full border border-edge bg-surface text-ink-muted hover:bg-surface-hover"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            aria-label="다음 계산기"
            className="flex size-8 items-center justify-center rounded-full border border-edge bg-surface text-ink-muted hover:bg-surface-hover"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {slides.map((slide, index) => (
            <div key={index} className="min-w-0 shrink-0 grow-0 basis-full">
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5">
        {slides.map((_, index) => (
          <button
            key={index}
            type="button"
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`${index + 1}번째 계산기로 이동`}
            className={`size-1.5 rounded-full transition-colors ${
              index === selectedIndex ? "bg-brand" : "bg-edge-strong"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
