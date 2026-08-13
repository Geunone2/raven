import Link from "next/link";
import {ContentSchedule, ScheduleCheckin} from "@/lib/db/schema";
import {
    bossTierLabels,
    bossTierStars,
    contentTypeLabels,
    contentTypeTone,
    getCheckinPoints,
    getScheduleBasePoints,
    isScheduleCheckinClosed,
} from "@/lib/constants/schedules";
import {hashTone} from "@/lib/colorHash";
import {Badge} from "@/components/atoms/Badge";
import {ScheduleCheckinButtons} from "@/components/atoms/ScheduleCheckinButtons";

export function AttendanceCard({
                                   schedules,
                                   myCheckinByScheduleId,
                                   myServer,
                               }: {
    schedules: ContentSchedule[];
    myCheckinByScheduleId: Map<number, ScheduleCheckin>;
    myServer: string | null;
}) {
    const items = schedules.slice(0, 2);

    return (
        <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md min-h-100">
            <div className="flex items-center justify-between">
                <p className="text-base font-bold text-brand">출석 체크</p>
                <Link href="/attendance" className="text-xs text-ink-muted hover:underline">
                    전체보기 &gt;
                </Link>
            </div>
            {items.length === 0 ? (
                <p className="mt-3 text-sm text-ink-faint">진행 중인 출석 체크가 없습니다.</p>
            ) : (
                <ul className="mt-3 space-y-3">
                    {items.map((schedule) => {
                        const myStatus = myCheckinByScheduleId.get(schedule.id)?.status ?? null;
                        const isClosed = isScheduleCheckinClosed(schedule);
                        const isServerMismatch = Boolean(
                            schedule.serverName && myServer && schedule.serverName !== myServer
                        );
                        const {bossPoints, combatPoints, total} = getScheduleBasePoints(schedule);
                        const earnedPoints = getCheckinPoints(total, myStatus);

                        return (
                            <li key={schedule.id} className="rounded-md border border-edge p-3 text-xs">
                                <div className="flex flex-row justify-between">
                                    <div className="flex flex-wrap items-center gap-1.5">
                                        <Badge tone={contentTypeTone[schedule.type]}>
                                            {contentTypeLabels[schedule.type]}
                                        </Badge>
                                        {schedule.serverName && (
                                            <Badge tone={hashTone(schedule.serverName)}>{schedule.serverName}</Badge>
                                        )}
                                    </div>
                                    <span className="font-bold text-brand">
                      {myStatus === "checked_in"
                          ? `획득 예정 ${earnedPoints}점`
                          : myStatus === "mid_join"
                              ? `중간합류 획득 ${earnedPoints}점`
                              : `출석 시 ${total}점`}
                    </span>
                                </div>

                                <p className="mt-2 truncate text-lg font-medium text-ink">{schedule.title}</p>
                                <p className="text-ink-faint">
                                    {schedule.date} {schedule.startTime}
                                </p>

                                {total > 0 && (
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
                                    </div>
                                )}

                                <ScheduleCheckinButtons
                                    scheduleId={schedule.id}
                                    myStatus={myStatus}
                                    disabled={isClosed || isServerMismatch}
                                />
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}
