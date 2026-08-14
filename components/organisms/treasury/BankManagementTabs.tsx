import type { ReactNode } from "react";
import { Tabs } from "@/components/molecules/Tabs";

// 통장 관리(/admin/bank) 하위 4개 카테고리 — 공용 통장 대시보드(현재 보유금/총
// 수입/총 지출)는 탭이 아니라 page.tsx에서 이 컴포넌트 위에 항상 고정으로
// 보여준다. "길드원 통장 상세 내역"은 별도 탭 없이 "길드원 개인 통장" 탭의
// 길드원별 "내역 보기" 링크(/admin/bank/[memberId])로 충분해 따로 만들지 않는다.
// 탭 전환/마운트 유지 로직은 공용 Tabs 컴포넌트(components/molecules/Tabs.tsx)가
// 담당하고, 여기서는 이 화면 전용 named prop만 key/label 배열로 변환해 넘긴다.
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
  return (
    <Tabs
      tabs={[
        { key: "unsettled", label: "정산 대기 중인 내판", content: unsettled },
        { key: "manual", label: "기타 수입/지출 입력", content: manual },
        { key: "treasury", label: "길드 통장 거래 내역", content: treasury },
        { key: "members", label: "길드원 개인 통장", content: members },
      ]}
    />
  );
}
