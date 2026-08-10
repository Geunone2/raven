import Link from "next/link";
import { lootDistributionStatuses } from "@/lib/db/schema";
import { distributionStatusLabels } from "@/lib/constants/dungeonRuns";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";

export function LootFilterBar({ defaultStatus }: { defaultStatus?: string }) {
  return (
    <form
      action="/admin/loots"
      className="flex flex-wrap items-end justify-between gap-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <Select name="status" defaultValue={defaultStatus ?? ""} className="w-40">
          <option value="">전체 상태</option>
          {lootDistributionStatuses.map((status) => (
            <option key={status} value={status}>
              {distributionStatusLabels[status]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          필터
        </Button>
      </div>
      <Link href="/admin/loots/new">
        <Button type="button">전리품 등록</Button>
      </Link>
    </form>
  );
}
