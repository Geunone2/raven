"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import { ContentSchedule, ScheduleCheckin } from "@/lib/db/schema";
import {
    bossTierLabels,
    bossTierStars,
    contentTypeLabels,
    contentTypeTone,
    getCheckinPoints,
    getScheduleBasePoints,
    isScheduleCheckinClosed,
    isScheduleCheckinNotStarted,
    NON_CONTRIBUTION_CONTENT_TYPES,
} from "@/lib/constants/schedule/schedules";
import { hashTone } from "@/lib/colorHash";
import { Badge } from "@/components/atoms/Badge";
import { ScheduleCheckinButtons } from "@/components/organisms/schedule/ScheduleCheckinButtons";

export function AttendanceCard({
                                   schedules,
                                   myCheckinByScheduleId,
                                   myServer,
                               }: {
    schedules: ContentSchedule[];
    myCheckinByScheduleId: Map<number, ScheduleCheckin>;
    myServer: string | null;
}) {
    // 자동재생은 안 쓴다 — 출석 체크 버튼을 누르는 도중에 슬라이드가 넘어가버리면
    // 안 되기 때문(경매 카드와 다른 점).
    const [emblaRef, emblaApi] = useEmblaCarousel({ loop: schedules.length > 1 });
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
        <div className="w-full min-h-100 max-h-100 overflow-hidden rounded-xl border border-edge bg-surface p-4 shadow-md">
            <div className="flex items-center justify-between">
                <p className="text-base font-bold text-brand">출석 체크</p>
                <Link href="/attendance" className="text-xs text-ink-muted hover:underline">
                    전체보기 &gt;
                </Link>
            </div>
            {schedules.length === 0 ? (
                <p className="mt-3 text-sm text-ink-faint">진행 중인 출석 체크가 없습니다.</p>
            ) : (
                <>
                    <div className="mt-8 overflow-hidden" ref={emblaRef}>
                        <div className="flex">
                            {schedules.map((schedule) => {
                                const myStatus = myCheckinByScheduleId.get(schedule.id)?.status ?? null;
                                const notStarted = isScheduleCheckinNotStarted(schedule);
                                const isClosed = isScheduleCheckinClosed(schedule);
                                const isServerMismatch = Boolean(
                                    schedule.serverName && myServer && schedule.serverName !== myServer
                                );
                                const {bossPoints, combatPoints, abyssDingPoints, total} = getScheduleBasePoints(schedule);
                                const earnedPoints = getCheckinPoints(total, myStatus);
                                // 쟁탈전/고대성채는 기여도 점수를 안 받는 콘텐츠 — 참석 여부만
                                // 기록하는 명단이라 점수 표시 자체를 안 보여준다.
                                const isPointless = (NON_CONTRIBUTION_CONTENT_TYPES as readonly string[]).includes(
                                    schedule.type
                                );

                                return (
                                    <div key={schedule.id} className="min-w-0 shrink-0 grow-0 basis-full">
                                        <div className="rounded-md border border-edge p-3 text-xs">
                                            <div className="flex flex-row justify-between">
                                                <div className="flex flex-wrap items-center gap-1.5">
                                                    <Badge tone={contentTypeTone[schedule.type]}>
                                                        {contentTypeLabels[schedule.type]}
                                                    </Badge>
                                                    {schedule.serverName && (
                                                        <Badge tone={hashTone(schedule.serverName)}>{schedule.serverName}</Badge>
                                                    )}
                                                </div>
                                                {isPointless ? (
                                                    <span className="text-ink-faint">명단 등록</span>
                                                ) : (
                                                    <span className="font-bold text-brand">
                          {myStatus === "checked_in"
                              ? `획득 예정 ${earnedPoints}점`
                              : myStatus === "mid_join"
                                  ? `중간합류 획득 ${earnedPoints}점`
                                  : `출석 시 ${total}점`}
                        </span>
                                                )}
                                            </div>

                                            <p className="mt-2 truncate text-lg font-medium text-ink">{schedule.title}</p>
                                            <p className="text-ink-faint">
                                                {schedule.date} {schedule.startTime}
                                            </p>

                                            {!isPointless && total > 0 && (
                                                <div className="mt-1.5 flex flex-wrap items-center gap-1 text-[11px]">
                                                    {bossPoints > 0 && (
                                                        <Badge tone="warning" size="sm">
                                                            {bossTierStars[schedule.bossTier] > 0
                                                                ? `★×${bossTierStars[schedule.bossTier]} `
                                                                : ""}
                                                            {bossTierLabels[schedule.bossTier]} {bossPoints}점
                                                        </Badge>
                                                    )}
                                                    {schedule.hasCombat && (
                                                        <Badge tone="info" size="sm">
                                                            전투 {schedule.combatHours ?? 0}시간 {combatPoints}점
                                                        </Badge>
                                                    )}
                                                    {schedule.hasAbyssDing && (
                                                        <Badge tone="danger" size="sm">
                                                            어비스 띵 {abyssDingPoints}점
                                                        </Badge>
                                                    )}
                                                </div>
                                            )}

                                            {notStarted ? (
                                                <p className="mt-3 text-xs text-ink-faint">
                                                    시작 시간 이후에 출석 체크 버튼이 나타납니다.
                                                </p>
                                            ) : (
                                                <ScheduleCheckinButtons
                                                    scheduleId={schedule.id}
                                                    myStatus={myStatus}
                                                    disabled={isClosed || isServerMismatch}
                                                />
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {schedules.length > 1 && (
                        <div className="mt-3 flex items-center justify-center gap-1.5">
                            {schedules.map((schedule, index) => (
                                <button
                                    key={schedule.id}
                                    type="button"
                                    onClick={() => emblaApi?.scrollTo(index)}
                                    aria-label={`${index + 1}번째 출석 체크로 이동`}
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
