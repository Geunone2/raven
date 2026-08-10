import {
  GuildMember,
  Participation,
  actualStatuses,
  plannedStatuses,
  ticketStatuses,
} from "@/lib/db/schema";
import {
  actualStatusLabels,
  plannedStatusLabels,
  ticketStatusLabels,
} from "@/lib/constants/participations";
import { Select } from "@/components/atoms/Select";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { saveParticipation } from "@/lib/actions/participations";

const plannedTone = {
  attend: "success",
  absent: "danger",
  undecided: "neutral",
} as const;

export function ParticipationTable({
  scheduleId,
  rows,
  showTicket = false,
}: {
  scheduleId: number;
  rows: { member: GuildMember; participation: Participation | null }[];
  showTicket?: boolean;
}) {
  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">닉네임</th>
            <th className="px-4 py-3 font-medium">레벨</th>
            <th className="px-4 py-3 font-medium">
              참석 신청 / 실제 참석 / 파티 / 역할
              {showTicket && " / 심연의 초대장"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {rows.map(({ member, participation }) => (
            <tr key={member.id}>
              <td className="px-4 py-3 font-medium text-ink">
                {member.nickname}
              </td>
              <td className="px-4 py-3 text-ink-faint">{member.level}</td>
              <td className="p-0">
                <form
                  action={saveParticipation.bind(null, scheduleId, member.id)}
                  className="flex items-center gap-2 px-4 py-2"
                >
                  <div className="flex items-center gap-2">
                    <Badge tone={plannedTone[participation?.plannedStatus ?? "undecided"]}>
                      {participation ? plannedStatusLabels[participation.plannedStatus] : "미응답"}
                    </Badge>
                    <Select
                      name="plannedStatus"
                      defaultValue={participation?.plannedStatus ?? "undecided"}
                      className="w-24 py-1 text-xs"
                    >
                      {plannedStatuses.map((status) => (
                        <option key={status} value={status}>
                          {plannedStatusLabels[status]}
                        </option>
                      ))}
                    </Select>
                  </div>
                  <Select
                    name="actualStatus"
                    defaultValue={participation?.actualStatus ?? ""}
                    className="w-28 py-1 text-xs"
                  >
                    <option value="">미체크</option>
                    {actualStatuses.map((status) => (
                      <option key={status} value={status}>
                        {actualStatusLabels[status]}
                      </option>
                    ))}
                  </Select>
                  <Input
                    name="partyName"
                    defaultValue={participation?.partyName ?? ""}
                    placeholder="파티"
                    className="w-24 py-1 text-xs"
                  />
                  <Input
                    name="role"
                    defaultValue={participation?.role ?? ""}
                    placeholder="역할"
                    className="w-24 py-1 text-xs"
                  />
                  {showTicket && (
                    <Select
                      name="ticketStatus"
                      defaultValue={participation?.ticketStatus ?? ""}
                      className="w-28 py-1 text-xs"
                    >
                      <option value="">확인 필요</option>
                      {ticketStatuses.map((status) => (
                        <option key={status} value={status}>
                          {ticketStatusLabels[status]}
                        </option>
                      ))}
                    </Select>
                  )}
                  <Button type="submit" variant="secondary" className="px-3 py-1.5 text-xs">
                    저장
                  </Button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
