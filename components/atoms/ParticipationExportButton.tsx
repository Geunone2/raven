"use client";

import { utils as xlsxUtils, writeFile as writeXlsxFile } from "xlsx";
import { Download } from "lucide-react";
import { GuildMember, Participation } from "@/lib/db/schema";
import {
  participationStatusLabels,
  ticketStatusLabels,
} from "@/lib/constants/participations";
import { getParticipationPoints } from "@/lib/constants/schedules";
import { Button } from "@/components/atoms/Button";

export function ParticipationExportButton({
  scheduleTitle,
  rows,
  basePoints,
  showTicket,
}: {
  scheduleTitle: string;
  rows: { member: GuildMember; participation: Participation | null }[];
  basePoints: number;
  showTicket: boolean;
}) {
  function handleExport() {
    const data = rows.map(({ member, participation }) => ({
      닉네임: member.nickname,
      레벨: member.level,
      보스기여도점수: getParticipationPoints(basePoints, participation?.status),
      참여상태: participation?.status
        ? participationStatusLabels[participation.status]
        : "미체크",
      ...(showTicket
        ? {
            심연의초대장: participation?.ticketStatus
              ? ticketStatusLabels[participation.ticketStatus]
              : "확인 필요",
          }
        : {}),
    }));
    const sheet = xlsxUtils.json_to_sheet(data);
    const workbook = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(workbook, sheet, "참여체크");
    writeXlsxFile(workbook, `참여체크_${scheduleTitle}.xlsx`);
  }

  return (
    <Button type="button" variant="secondary" onClick={handleExport}>
      <Download className="mr-1.5 inline size-4" />
      엑셀로 내보내기
    </Button>
  );
}
