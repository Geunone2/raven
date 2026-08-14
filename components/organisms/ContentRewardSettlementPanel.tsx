"use client";

import { useState } from "react";
import { ContentSchedule } from "@/lib/db/schema";
import { ContentRewardSettlementRow } from "@/components/organisms/ContentRewardSettlementRow";

export function ContentRewardSettlementPanel({
  schedules,
  emptyMessage = "정산 대기 중인 일정이 없습니다.",
}: {
  schedules: ContentSchedule[];
  emptyMessage?: string;
}) {
  // 최초 진입 시점의 미정산 목록을 그대로 고정해서 쓴다 — 정산 실행 후
  // revalidatePath로 서버 쪽 목록에서 해당 일정이 빠져도, 방금 정산한 결과(분배
  // 비율 표)가 화면에서 바로 사라지지 않고 그 자리에 남아있게 하기 위함이다.
  // 페이지를 새로 열면 그때는 이미 정산된 건이 빠진 새 목록을 받는다.
  const [frozenSchedules] = useState(schedules);

  if (frozenSchedules.length === 0) {
    return <p className="py-6 text-center text-sm text-ink-faint">{emptyMessage}</p>;
  }

  return (
    <ul className="divide-y divide-edge rounded-md border border-edge">
      {frozenSchedules.map((schedule) => (
        <ContentRewardSettlementRow key={schedule.id} schedule={schedule} />
      ))}
    </ul>
  );
}
