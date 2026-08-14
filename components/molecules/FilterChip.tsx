"use client";

import { Badge, type Tone } from "@/components/atoms/Badge";

// MemberPanel.tsx와 RankingPanel.tsx에 완전히 동일한 구현이 중복돼 있던
// 필터 토글 뱃지 버튼을 하나로 뺐다(2026-08-15).
export function FilterChip({
  label,
  tone,
  active,
  onClick,
}: {
  label: string;
  tone: Tone;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full transition-shadow ${
        active ? "ring-2 ring-brand" : "hover:ring-2 hover:ring-edge-strong"
      }`}
    >
      <Badge tone={tone} size="lg">
        {label}
      </Badge>
    </button>
  );
}
