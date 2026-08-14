import Link from "next/link";
import { lootDistributionStatuses } from "@/lib/db/schema";
import { distributionStatusLabels } from "@/lib/constants/dungeonRuns";
import { Button } from "@/components/atoms/Button";

const ALL_VALUE = "";

export function LootFilterBar({ defaultStatus }: { defaultStatus?: string }) {
  const activeStatus = defaultStatus ?? ALL_VALUE;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-ink-faint">상태</span>
        {[
          { value: ALL_VALUE, label: "전체 상태" },
          ...lootDistributionStatuses.map((status) => ({
            value: status,
            label: distributionStatusLabels[status],
          })),
        ].map(({ value, label }) => (
          <Link
            key={value || "all"}
            href={value ? `/admin/loots?status=${value}` : "/admin/loots"}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              activeStatus === value
                ? "border-brand bg-brand text-ink-inverse"
                : "border-edge-strong text-ink-muted hover:border-brand"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
      <Link href="/admin/loots/new">
        <Button type="button">전리품 등록</Button>
      </Link>
    </div>
  );
}
