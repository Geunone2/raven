"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";

type Tab = "unsettled" | "manual" | "treasury" | "members";

const TAB_LABELS: Record<Tab, string> = {
  unsettled: "정산 대기 중인 내판",
  manual: "기타 수입/지출 입력",
  treasury: "길드 통장 거래 내역",
  members: "길드원 개인 통장",
};

// 통장 관리(/admin/bank) 하위 4개 카테고리 — 공용 통장 대시보드(현재 보유금/총
// 수입/총 지출)는 탭이 아니라 page.tsx에서 이 컴포넌트 위에 항상 고정으로
// 보여준다(2026-08-14, 탭 안에 있으면 다른 탭 보는 동안 안 보이는 게 불편하다는
// 피드백). "길드원 통장 상세 내역"은 별도 탭 없이 "길드원 개인 통장" 탭의
// 길드원별 "내역 보기" 링크(/admin/bank/[memberId])로 충분해 따로 만들지 않는다
// (2026-08-14). 필요한 데이터는 서버 컴포넌트인 page.tsx가 전부 미리 불러와서
// 각 탭의 내용(ReactNode)으로 그대로 넘긴다. 탭 전환은 CSS(hidden)로 숨기고
// 보여주기만 할 뿐, 네 개 다 항상 마운트된 상태를 유지한다
// (LootDistributionTabs.tsx와 같은 패턴).
export function BankManagementTabs({
  unsettled,
  manual,
  treasury,
  members,
}: {
  unsettled: ReactNode;
  manual: ReactNode;
  treasury: ReactNode;
  members: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("unsettled");

  const panels: Record<Tab, ReactNode> = {
    unsettled,
    manual,
    treasury,
    members,
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {(Object.keys(TAB_LABELS) as Tab[]).map((key) => (
          <Button
            key={key}
            type="button"
            variant={tab === key ? "primary" : "secondary"}
            onClick={() => setTab(key)}
            className="shrink-0 whitespace-nowrap"
          >
            {TAB_LABELS[key]}
          </Button>
        ))}
      </div>

      {(Object.keys(TAB_LABELS) as Tab[]).map((key) => (
        <div key={key} className={tab === key ? "" : "hidden"}>
          {panels[key]}
        </div>
      ))}
    </div>
  );
}
