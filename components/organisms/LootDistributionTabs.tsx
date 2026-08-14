"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";

type Tab = "auction" | "siege" | "ancient_fortress";

const TAB_LABELS: Record<Tab, string> = {
  auction: "경매 (내판)",
  siege: "쟁탈전 보상 분배",
  ancient_fortress: "고대성채 보상 분배",
};

// "보상 분배"(/admin/loots) 하위 3개 카테고리 — 필요한 데이터는 서버 컴포넌트인
// page.tsx가 전부 미리 불러와서 각 탭의 내용(ReactNode)으로 그대로 넘긴다.
// 탭 전환은 CSS(hidden)로 숨기고 보여주기만 할 뿐, 셋 다 항상 마운트된 상태를
// 유지한다 — 조건부 렌더링으로 뺐다 끼웠다 하면 쟁탈전/고대성채 탭에서 정산
// 실행 직후 나온 분배 결과 표가 다른 탭 갔다오는 사이 초기화돼버리기 때문
// (대시보드 모바일/태블릿 병렬 레이아웃과 같은 이유의 같은 기법).
export function LootDistributionTabs({
  auction,
  siege,
  ancientFortress,
}: {
  auction: ReactNode;
  siege: ReactNode;
  ancientFortress: ReactNode;
}) {
  const [tab, setTab] = useState<Tab>("auction");

  const panels: Record<Tab, ReactNode> = {
    auction,
    siege,
    ancient_fortress: ancientFortress,
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
