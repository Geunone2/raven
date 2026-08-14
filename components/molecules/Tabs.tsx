"use client";

import { useState, type ReactNode } from "react";
import { Button } from "@/components/atoms/Button";

export type TabItem = { key: string; label: string; content: ReactNode };

// LootDistributionTabs.tsx와 BankManagementTabs.tsx가 구조적으로 완전히
// 동일했던 것(탭 버튼 + CSS hidden 토글로 전 패널을 항상 마운트 상태로 유지)을
// 제네릭 컴포넌트로 뺐다(2026-08-15). 두 파일은 이제 이 컴포넌트를 감싸는
// 얇은 도메인별 wrapper로 남아 호출부의 named prop(예: auction/siege)은
// 그대로 유지된다.
//
// 패널을 조건부 렌더링 대신 hidden으로 감춰서 전부 마운트 상태를 유지하는
// 이유: 다른 탭 갔다와도 내부 상태(예: 정산 미리보기 결과)가 초기화되지
// 않아야 하는 화면들이 있기 때문(ContentRewardSettlementRow 등).
export function Tabs({ tabs, defaultKey }: { tabs: TabItem[]; defaultKey?: string }) {
  const [active, setActive] = useState(defaultKey ?? tabs[0]?.key);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            type="button"
            variant={active === tab.key ? "primary" : "secondary"}
            onClick={() => setActive(tab.key)}
            className="shrink-0 whitespace-nowrap"
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {tabs.map((tab) => (
        <div key={tab.key} className={active === tab.key ? "" : "hidden"}>
          {tab.content}
        </div>
      ))}
    </div>
  );
}
