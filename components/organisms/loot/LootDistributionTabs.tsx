import type { ReactNode } from "react";
import { Tabs } from "@/components/molecules/Tabs";

// "보상 분배"(/admin/loots) 하위 3개 카테고리 — 필요한 데이터는 서버 컴포넌트인
// page.tsx가 전부 미리 불러와서 각 탭의 내용(ReactNode)으로 그대로 넘긴다.
// 탭 전환/마운트 유지 로직은 공용 Tabs 컴포넌트(components/molecules/Tabs.tsx)가
// 담당하고, 여기서는 이 화면 전용 named prop(auction/siege/ancientFortress)만
// key/label 배열로 변환해 넘긴다.
export function LootDistributionTabs({
  auction,
  siege,
  ancientFortress,
}: {
  auction: ReactNode;
  siege: ReactNode;
  ancientFortress: ReactNode;
}) {
  return (
    <Tabs
      tabs={[
        { key: "auction", label: "경매 (내판)", content: auction },
        { key: "siege", label: "쟁탈전 보상 분배", content: siege },
        { key: "ancient_fortress", label: "고대성채 보상 분배", content: ancientFortress },
      ]}
    />
  );
}
