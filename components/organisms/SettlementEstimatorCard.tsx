"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { SpinRevealText } from "@/components/atoms/SpinRevealText";

const CALCULATION_DELAY_MS = 2000;

function Row({
  label,
  value,
  mask,
  revealed,
  spinKey,
}: {
  label: string;
  value: string;
  mask: string;
  revealed: boolean;
  spinKey: number;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className="font-medium text-ink">
        {revealed ? <SpinRevealText text={value} spinKey={spinKey} /> : mask}
      </span>
    </div>
  );
}

export function SettlementEstimatorCard({
  myPoints,
  totalPoints,
  myPower,
  totalPower,
  totalRewardPool,
  participationRewardRatio,
  powerRewardRatio,
}: {
  myPoints: number;
  totalPoints: number;
  myPower: number;
  totalPower: number;
  totalRewardPool: number;
  // 전부 %(0~100) 단위 — /admin/settings에서 조정한 값을 그대로 받는다.
  participationRewardRatio: number;
  powerRewardRatio: number;
}) {
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [resultKey, setResultKey] = useState(0);

  // 참여 보상은 이번 2주 구간의 전체 보스 참여도(콘텐츠 종류 상관없이 2/3/4성
  // 보스·어비스보스·전투 참여 점수 합산) 비율로, 전투력 보상은 전체 길드원 전투력
  // 비율로 계산한다 — settleLootSale(장비 내판 정산 실행)과 동일한 방식.
  // totalRewardPool은 이미 세금/혈비/총무비가 빠진 "누적 지급 보상 합계"(참여+
  // 전투력 보상 몫의 합)라, 그 안에서 참여:전투력 비중을 참여보상 비율과
  // 전투력보상 비율의 상대 비(정규화)로 나눈다.
  const totalRewardRatio = participationRewardRatio + powerRewardRatio;
  const participationWeight = totalRewardRatio > 0 ? participationRewardRatio / totalRewardRatio : 0.5;
  const powerWeight = totalRewardRatio > 0 ? powerRewardRatio / totalRewardRatio : 0.5;
  const participationRatio = totalPoints > 0 ? myPoints / totalPoints : 0;
  const powerRatio = totalPower > 0 ? myPower / totalPower : 0;
  const myParticipationShare = totalRewardPool * participationWeight * participationRatio;
  const myPowerShare = totalRewardPool * powerWeight * powerRatio;
  const myEstimatedShare = Math.round(myParticipationShare + myPowerShare);

  const revealed = status === "done";

  function handleCalculate() {
    setStatus("loading");
    setTimeout(() => {
      setStatus("done");
      setResultKey((prev) => prev + 1);
    }, CALCULATION_DELAY_MS);
  }

  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md min-h-120">
      <p className="text-base font-bold text-brand">장비 내판 - 내가 받을 수 있는 정산 몫은?</p>
      <p className="mt-1 font-mono text-xs text-ink-faint">
        내 몫 = 누적 지급액 × (참여 비율 × {Math.round(participationWeight * 100)}% + 전투력 비율 ×{" "}
        {Math.round(powerWeight * 100)}%)
      </p>

      <div className="mt-4 space-y-1.5">
        <Row
          label="누적 지급 보상 합계"
          value={`${totalRewardPool.toLocaleString()} 크리스탈`}
          mask="? 크리스탈"
          revealed={revealed}
          spinKey={resultKey}
        />
        <Row
          label="내 보스 참여 비율"
          value={`${(participationRatio * 100).toFixed(2)}%`}
          mask="? %"
          revealed={revealed}
          spinKey={resultKey}
        />
        <Row
          label="내 전투력 비율"
          value={`${(powerRatio * 100).toFixed(2)}%`}
          mask="? %"
          revealed={revealed}
          spinKey={resultKey}
        />
      </div>

      {status === "idle" && (
        <div className="mt-4 flex justify-center">
          <Button type="button" onClick={handleCalculate}>
            계산하기
          </Button>
        </div>
      )}

      {status === "loading" && (
        <div className="mt-4 flex flex-col items-center gap-2 py-4">
          <Loader2 className="size-6 animate-spin text-brand" />
          <p className="text-sm text-ink-faint">계산 중...</p>
        </div>
      )}

      {status === "done" && (
        <>
          <div className="mt-4 border-t border-edge pt-3">
            <p className="text-xs text-ink-faint">
              참여 몫 {Math.round(myParticipationShare).toLocaleString()} + 전투력 몫{" "}
              {Math.round(myPowerShare).toLocaleString()}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-sm font-medium text-ink">내 예상 몫</span>
              <span className="text-2xl font-bold text-brand">
                <SpinRevealText text={myEstimatedShare.toLocaleString()} spinKey={resultKey} />
                <span className="ml-1 text-sm font-medium text-ink-muted">크리스탈</span>
              </span>
            </div>
          </div>

          <div className="mt-3 flex justify-center">
            <Button type="button" variant="secondary" onClick={handleCalculate}>
              다시 계산하기
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
