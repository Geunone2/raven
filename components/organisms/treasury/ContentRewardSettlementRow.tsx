"use client";

import { useActionState, useState, useTransition } from "react";
import { Download } from "lucide-react";
import { ContentSchedule } from "@/lib/db/schema";
import {
  confirmContentReward,
  previewContentReward,
  type ContentRewardBreakdownRow,
} from "@/lib/actions/treasury/contentRewards";
import { attendanceStatusLabels } from "@/lib/constants/schedule/attendance";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { Badge } from "@/components/atoms/Badge";
import { exportToExcel } from "@/lib/excel";

function exportBreakdownToExcel(schedule: ContentSchedule, breakdown: ContentRewardBreakdownRow[]) {
  const data = breakdown.map((row) => ({
    닉네임: row.nickname,
    참여상태: attendanceStatusLabels[row.status],
    보스기여도배분: row.bossShare,
    전투력기여도배분: row.powerShare,
    합계: row.amount,
    분배비율: `${row.ratio}%`,
  }));
  exportToExcel(data, "보상분배", `보상분배_${schedule.title}_${schedule.date}.xlsx`);
}

function LoadingNote({ label }: { label: string }) {
  return (
    <p className="flex items-center justify-center gap-3 py-4 text-sm text-ink-faint">
      <span className="size-6 shrink-0 animate-spin rounded-full border-[3px] border-edge-strong border-t-brand" />
      {label}
    </p>
  );
}

function BreakdownTable({ breakdown }: { breakdown: ContentRewardBreakdownRow[] }) {
  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      {/* 보스/전투력 기여도 배분 내역은 PC부터만 보여준다(2026-08-14) — 닉네임/
          참여 상태/합계/분배 비율만 있으면 화면이 깨지지 않는다. */}
      <table className="w-full min-w-[360px] text-left text-xs md:min-w-[440px] xl:min-w-[560px]">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-3 py-2 font-medium">닉네임</th>
            <th className="px-3 py-2 font-medium">참여 상태</th>
            <th className="hidden px-3 py-2 font-medium xl:table-cell">보스 기여도 배분</th>
            <th className="hidden px-3 py-2 font-medium xl:table-cell">전투력 기여도 배분</th>
            <th className="px-3 py-2 font-medium">합계</th>
            <th className="hidden px-3 py-2 font-medium md:table-cell">분배 비율</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {breakdown
            .slice()
            .sort((a, b) => b.amount - a.amount)
            .map((row) => (
              <tr key={row.memberId}>
                <td className="px-3 py-2 font-medium text-ink">{row.nickname}</td>
                <td className="px-3 py-2">
                  <Badge tone={row.status === "checked_in" ? "success" : "info"} size="sm">
                    {attendanceStatusLabels[row.status]}
                  </Badge>
                </td>
                <td className="hidden px-3 py-2 text-ink-faint xl:table-cell">
                  {row.bossShare.toLocaleString()}
                </td>
                <td className="hidden px-3 py-2 text-ink-faint xl:table-cell">
                  {row.powerShare.toLocaleString()}
                </td>
                <td className="px-3 py-2 font-medium text-brand">{row.amount.toLocaleString()}</td>
                <td className="hidden px-3 py-2 text-ink-faint md:table-cell">{row.ratio}%</td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

// key={resetKey}로 통째로 리마운트시켜서 "다시 입력"을 구현한다 — useActionState는
// 자체적으로 리셋하는 방법이 없어서, 이 안쪽 컴포넌트를 새로 마운트해 previewState를
// null로 되돌리는 방식을 쓴다.
function ContentRewardSettlementFlow({
  schedule,
  onRestart,
}: {
  schedule: ContentSchedule;
  onRestart: () => void;
}) {
  const [previewState, previewAction, isPreviewing] = useActionState(
    previewContentReward.bind(null, schedule.id),
    null
  );
  const [confirmed, setConfirmed] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
  const [isConfirming, startConfirm] = useTransition();

  function handleConfirm() {
    if (!previewState?.ok || !previewState.breakdown || previewState.totalDia == null) return;
    startConfirm(async () => {
      const result = await confirmContentReward(
        schedule.id,
        previewState.breakdown!,
        previewState.totalDia!
      );
      setConfirmMessage(result.message);
      if (result.ok) setConfirmed(true);
    });
  }

  const hasPreview = previewState?.ok && previewState.breakdown;

  return (
    <li className="px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="font-medium text-ink">{schedule.title}</p>
          <p className="text-ink-faint">{schedule.date}</p>
        </div>
        {!hasPreview && !confirmed && (
          <form action={previewAction} className="flex items-center gap-2">
            <Input
              type="number"
              name="totalDia"
              min="1"
              placeholder="획득 다이아"
              className="w-32"
              required
            />
            <Button
              type="submit"
              size="md"
              disabled={isPreviewing}
              className="shrink-0 whitespace-nowrap"
            >
              정산 내역 확인
            </Button>
          </form>
        )}
        {confirmed && (
          <Badge tone="success">정산 완료</Badge>
        )}
      </div>

      {isPreviewing && <LoadingNote label="정산 내역을 계산하는 중입니다..." />}

      {previewState && !previewState.ok && (
        <p className="mt-2 text-xs text-danger">{previewState.message}</p>
      )}

      {hasPreview && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs text-ink-faint">참여 {previewState.breakdown!.length}명</p>
            <Button
              type="button"
              variant="secondary"
              size="md"
              className="shrink-0 whitespace-nowrap"
              onClick={() => exportBreakdownToExcel(schedule, previewState.breakdown!)}
            >
              <Download className="mr-1.5 inline size-4" />
              엑셀로 내보내기
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-1 rounded-md border border-edge bg-surface-raised px-3 py-2 text-xs sm:grid-cols-4">
            <div>
              <p className="text-ink-faint">획득 다이아</p>
              <p className="font-medium text-ink">{previewState.totalDia?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-ink-faint">혈비 ({previewState.reserveRatio}%)</p>
              <p className="font-medium text-ink">-{previewState.reserveAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-ink-faint">총무비 ({previewState.adminFeeRatio}%)</p>
              <p className="font-medium text-ink">-{previewState.adminFeeAmount?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-ink-faint">분배 대상 금액</p>
              <p className="font-medium text-brand">{previewState.remainingPool?.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-ink-faint">참여도 풀 ({previewState.participationRewardRatio}%)</p>
              <p className="font-medium text-ink">
                {Math.floor(
                  (previewState.totalDia ?? 0) * ((previewState.participationRewardRatio ?? 0) / 100)
                ).toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-ink-faint">전투력 풀 ({previewState.powerRewardRatio}%)</p>
              <p className="font-medium text-ink">
                {Math.floor(
                  (previewState.totalDia ?? 0) * ((previewState.powerRewardRatio ?? 0) / 100)
                ).toLocaleString()}
              </p>
            </div>
          </div>

          <BreakdownTable breakdown={previewState.breakdown!} />

          {isConfirming && <LoadingNote label="정산을 반영하는 중입니다..." />}

          {!confirmed && !isConfirming && (
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={onRestart}
                className="shrink-0 whitespace-nowrap"
              >
                다시 입력
              </Button>
              <Button
                type="button"
                onClick={handleConfirm}
                className="shrink-0 whitespace-nowrap"
              >
                최종 확인 · 정산 실행
              </Button>
            </div>
          )}

          {confirmed && confirmMessage && (
            <p className="text-xs text-ink-faint">{confirmMessage}</p>
          )}
        </div>
      )}
    </li>
  );
}

// 정산 실행 전에는 "다이아 입력 + 정산 내역 확인" 폼을, 확인 후에는 참여자별
// 분배 비율 표 + 최종 확인 버튼을 같은 자리에 보여준다. 목록(부모)에서 이 일정이
// 빠져나가도(정산 완료 → getUnsettledContentRewardSchedules에서 제외) 이 행
// 자체는 부모가 최초 조회 시점의 목록을 그대로 고정해서 렌더링하므로 사라지지 않는다.
export function ContentRewardSettlementRow({ schedule }: { schedule: ContentSchedule }) {
  const [resetKey, setResetKey] = useState(0);
  return (
    <ContentRewardSettlementFlow
      key={resetKey}
      schedule={schedule}
      onRestart={() => setResetKey((key) => key + 1)}
    />
  );
}
