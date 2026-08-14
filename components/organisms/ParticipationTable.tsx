import { GuildMember, Participation, participationStatuses, ticketStatuses } from "@/lib/db/schema";
import {
  participationStatusLabels,
  participationStatusTone,
  ticketStatusLabels,
} from "@/lib/constants/participations";
import { getParticipationPoints } from "@/lib/constants/schedules";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { saveParticipationsBulk } from "@/lib/actions/participations";

export function ParticipationTable({
  scheduleId,
  rows,
  basePoints,
  showTicket = false,
}: {
  scheduleId: number;
  rows: { member: GuildMember; participation: Participation | null }[];
  basePoints: number;
  showTicket?: boolean;
}) {
  return (
    // 행마다 따로 저장하지 않고, 표 전체를 하나의 폼으로 감싸서 한 번에 저장한다
    // (2026-08-14). 각 드롭다운은 name="status_{memberId}"로 구분해서 하나의
    // FormData 안에 모든 행의 값이 같이 담기게 한다.
    <form action={saveParticipationsBulk.bind(null, scheduleId)} className="space-y-3">
      <div className="flex justify-end">
        <Button type="submit">저장</Button>
      </div>
      <div className="overflow-x-auto rounded-md border border-edge">
        {/* 레벨/보스 기여도 점수는 태블릿부터만 보여준다(2026-08-14) — 닉네임과
            참여 상태 드롭다운(이 표의 핵심 조작부)만 있으면 화면이 깨지지 않는다.
            드롭다운의 값은 CustomSelect 내부 hidden input으로 제출되므로 칼럼을
            숨겨도(display:none) 폼 제출값에는 영향이 없다. */}
        <table className="w-full min-w-[420px] text-left text-sm md:min-w-[640px] xl:min-w-[800px]">
          <thead className="bg-surface-raised text-ink-faint">
            <tr>
              <th className="px-4 py-3 font-medium">닉네임</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">레벨</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">보스 기여도 점수</th>
              <th className="px-4 py-3 font-medium">
                참여 상태
                {showTicket && " / 심연의 초대장"}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-edge">
            {rows.map(({ member, participation }) => {
              const earnedPoints = getParticipationPoints(basePoints, participation?.status);
              return (
                <tr key={member.id}>
                  <td className="px-4 py-3 font-medium text-ink">
                    {member.nickname}
                  </td>
                  <td className="hidden px-4 py-3 text-ink-faint md:table-cell">{member.level}</td>
                  <td className="hidden px-4 py-3 font-medium text-brand md:table-cell">
                    {earnedPoints}점
                  </td>
                  <td className="p-0">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-20 shrink-0">
                          {participation?.status ? (
                            <Badge tone={participationStatusTone[participation.status]}>
                              {participationStatusLabels[participation.status]}
                            </Badge>
                          ) : (
                            <Badge tone="neutral">미체크</Badge>
                          )}
                        </div>
                        <CustomSelect
                          name={`status_${member.id}`}
                          defaultValue={participation?.status ?? ""}
                          className="w-28 shrink-0"
                          options={[
                            { value: "", label: "미체크" },
                            ...participationStatuses.map((status) => ({
                              value: status,
                              label: participationStatusLabels[status],
                            })),
                          ]}
                        />
                      </div>
                      {showTicket && (
                        <CustomSelect
                          name={`ticketStatus_${member.id}`}
                          defaultValue={participation?.ticketStatus ?? ""}
                          className="w-28 shrink-0"
                          options={[
                            { value: "", label: "확인 필요" },
                            ...ticketStatuses.map((status) => ({
                              value: status,
                              label: ticketStatusLabels[status],
                            })),
                          ]}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </form>
  );
}
