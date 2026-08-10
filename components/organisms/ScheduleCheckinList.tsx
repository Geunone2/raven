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
import {getGuildServer} from "@/lib/constants/members";
import {hashTone} from "@/lib/colorHash";
import {Badge} from "@/components/atoms/Badge";
import {ScheduleCheckinButtons} from "@/components/atoms/ScheduleCheckinButtons";
import {ScheduleCheckinRoster} from "@/components/atoms/ScheduleCheckinRoster";
import type {ScheduleCheckinRosterEntry} from "@/lib/actions/scheduleCheckins";

export function ScheduleCheckinList({
                                        schedules,
                                        myCheckinByScheduleId,
                                        myGuildName,
                                        rosterByScheduleId,
                                    }: {
    schedules: ContentSchedule[];
    myCheckinByScheduleId: Map<number, ScheduleCheckin>;
    myGuildName: string | null;
    rosterByScheduleId: Map<number, ScheduleCheckinRosterEntry[]>;
}) {
    if (schedules.length === 0) {
        return (
            <p className="py-12 text-center text-sm text-ink-faint">
                등록된 일정이 없습니다.
            </p>
        );
    }

    const myServer = getGuildServer(myGuildName);

    return (
        <ul className="space-y-3">
            {schedules.map((schedule) => {
                const myStatus = myCheckinByScheduleId.get(schedule.id)?.status ?? null;
                const isClosed = isScheduleCheckinClosed(schedule);
                const isServerMismatch = Boolean(
                    schedule.serverName && myServer && schedule.serverName !== myServer
                );
                const isDisabled = isClosed || isServerMismatch;
                const {bossPoints, combatPoints, total} = getScheduleBasePoints(schedule);
                const earnedPoints = getCheckinPoints(total, myStatus);

                return (
                    <li
                        key={schedule.id}
                        className="rounded-xl border border-edge bg-white p-4 shadow-md"
                    >
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
                          ? `중간합류 획득 ${earnedPoints}점 (절반)`
                          : `출석 시 ${total}점`}
                </span>
                        </div>

                        <div className="mt-2 flex items-start justify-between gap-2">
                            <p className="font-medium text-ink">{schedule.title}</p>
                            <span className="shrink-0 text-sm text-ink-faint">
                {schedule.date} {schedule.gatherTime ?? "-"} / {schedule.startTime}
              </span>
                        </div>

                        {total > 0 && (
                            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
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
                            disabled={isDisabled}
                        />

                        <ScheduleCheckinRoster roster={rosterByScheduleId.get(schedule.id) ?? []}/>

                        {isServerMismatch && (
                            <p className="mt-2 text-xs text-danger">
                                {myGuildName}({myServer}) 소속은 {schedule.serverName} 서버 일정에 출석할 수
                                없습니다.
                            </p>
                        )}
                        {!isServerMismatch && isClosed && (
                            <p className="mt-2 text-xs text-ink-faint">
                                출석 가능 시간(시작 후 6시간)이 지나 응답을 변경할 수 없습니다.
                            </p>
                        )}
                    </li>
                );
            })}
        </ul>
    );
}
