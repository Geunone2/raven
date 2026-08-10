import Link from "next/link";
import { contentTypes } from "@/lib/db/schema";
import { contentTypeLabels } from "@/lib/constants/schedules";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";

export function ScheduleFilterBar({ defaultType }: { defaultType?: string }) {
  return (
    <form
      action="/admin/schedules"
      className="flex flex-wrap items-end justify-between gap-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <Select name="type" defaultValue={defaultType ?? ""} className="w-40">
          <option value="">전체 콘텐츠</option>
          {contentTypes.map((type) => (
            <option key={type} value={type}>
              {contentTypeLabels[type]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          필터
        </Button>
      </div>
      <Link href="/admin/schedules/new">
        <Button type="button">일정 등록</Button>
      </Link>
    </form>
  );
}
