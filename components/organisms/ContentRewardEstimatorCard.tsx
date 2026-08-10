"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { ADMIN_FEE_RATIO, RESERVE_RATIO } from "@/lib/constants/treasury";
import { Input } from "@/components/atoms/Input";
import { Label } from "@/components/atoms/Label";
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

const BOSS_SHARE_OF_POOL = 0.5;
const POWER_SHARE_OF_POOL = 0.5;

export function ContentRewardEstimatorCard({
  title,
  myPower,
  totalPower,
  myScore,
  totalScore,
}: {
  title: string;
  myPower: number;
  totalPower: number;
  myScore: number;
  totalScore: number;
}) {
  const [totalDiaInput, setTotalDiaInput] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");
  const [resultKey, setResultKey] = useState(0);

  const totalDia = Math.max(0, Number(totalDiaInput) || 0);
  const canCalculate = totalDia > 0;
  const revealed = status === "done";

  // 고대성채/쟁탈전은 장비 내판과 달리 세금이 없다. 총 다이아에서 혈비 30% /
  // 총무비 6%만 뗀 나머지(64%)를 전투력 50% + 참여도 50%로 나눈다 —
  // settleContentReward(관리자의 실제 정산 실행)와 동일한 방식. 50%/50%는 그
  // 자체가 지급액이 아니라 "전체 전투력에서 내 전투력 비율"과 "전체 참여도
  // 점수에서 내 참여도 점수 비율"이 최종 몫에서 차지하는 가중치다.
  const reserveAmount = Math.floor(totalDia * RESERVE_RATIO);
  const adminFeeAmount = Math.floor(totalDia * ADMIN_FEE_RATIO);
  const remainingPool = totalDia - reserveAmount - adminFeeAmount;
  const bossPool = remainingPool * BOSS_SHARE_OF_POOL;
  const powerPool = remainingPool * POWER_SHARE_OF_POOL;

  // 전투력 비율과 참여도 비율 모두 전체 길드원이 아니라, 이번 2주 구간 동안
  // 실제로 이 콘텐츠(고대성채/쟁탈전)에 출석/중간합류한 사람들끼리의 비율이다 —
  // settleContentReward가 실제 정산에서 쓰는 것과 동일한 기준. 이번 구간에
  // 참여한 적이 없으면 두 비율 모두 0이라 몫도 자동으로 0이 된다.
  const powerRatio = totalPower > 0 ? myPower / totalPower : 0;
  const scoreRatio = totalScore > 0 ? myScore / totalScore : 0;
  const myPowerShare = Math.floor(powerPool * powerRatio);
  const myBossShare = Math.floor(bossPool * scoreRatio);
  const myEstimatedTotal = myPowerShare + myBossShare;

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setTotalDiaInput(event.target.value);
    setStatus("idle");
  }

  function handleCalculate() {
    if (!canCalculate) return;
    setStatus("loading");
    setTimeout(() => {
      setStatus("done");
      setResultKey((prev) => prev + 1);
    }, CALCULATION_DELAY_MS);
  }

  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md min-h-120">
      <p className="text-base font-bold text-brand">{title} - 참여 시 예상 정산 몫은?</p>
      <p className="mt-1 font-mono text-xs text-ink-faint">
        남은 금액 = 다이아 − 혈비(30%) − 총무비(6%)
        <br />내 몫 = 남은 금액 × (전투력 비율 × 50% + 참여도 비율 × 50%)
      </p>

      <div className="mt-4">
        <Label htmlFor={`${title}-totalDia`}>획득 예상 다이아</Label>
        <Input
          id={`${title}-totalDia`}
          type="number"
          min="0"
          value={totalDiaInput}
          onChange={handleInputChange}
        />
      </div>

      <div className="mt-4 space-y-1.5">
        <Row
          label="혈비 30%"
          value={`${reserveAmount.toLocaleString()} 크리스탈`}
          mask="? 크리스탈"
          revealed={revealed}
          spinKey={resultKey}
        />
        <Row
          label="총무비 6%"
          value={`${adminFeeAmount.toLocaleString()} 크리스탈`}
          mask="? 크리스탈"
          revealed={revealed}
          spinKey={resultKey}
        />
        <Row
          label="참여도 풀 (50%)"
          value={`${Math.floor(bossPool).toLocaleString()} 크리스탈`}
          mask="? 크리스탈"
          revealed={revealed}
          spinKey={resultKey}
        />
        <Row
          label="전투력 풀 (50%)"
          value={`${Math.floor(powerPool).toLocaleString()} 크리스탈`}
          mask="? 크리스탈"
          revealed={revealed}
          spinKey={resultKey}
        />
        <Row
          label="내 전투력 비율 (2주간 참여자 중)"
          value={`${(powerRatio * 100).toFixed(2)}%`}
          mask="? %"
          revealed={revealed}
          spinKey={resultKey}
        />
        <Row
          label="내 참여도 비율 (2주간 참여자 중)"
          value={`${(scoreRatio * 100).toFixed(2)}%`}
          mask="? %"
          revealed={revealed}
          spinKey={resultKey}
        />
      </div>

      {status === "idle" && (
        <div className="mt-4 flex flex-col items-center gap-1">
          <Button type="button" onClick={handleCalculate} disabled={!canCalculate}>
            계산하기
          </Button>
          {!canCalculate && <p className="text-xs text-ink-faint">다이아를 입력하세요</p>}
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
              전투력 몫 {myPowerShare.toLocaleString()} + 참여도 몫{" "}
              {myBossShare.toLocaleString()}
            </p>
            <div className="mt-2 flex items-end justify-between">
              <span className="text-sm font-medium text-ink">내 예상 몫</span>
              <span className="text-2xl font-bold text-brand">
                <SpinRevealText text={myEstimatedTotal.toLocaleString()} spinKey={resultKey} />
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
