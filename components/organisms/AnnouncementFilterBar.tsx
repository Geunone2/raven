import Link from "next/link";
import { announcementCategories } from "@/lib/db/schema";
import { announcementCategoryLabels } from "@/lib/constants/announcements";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";

export function AnnouncementFilterBar({
  defaultCategory,
}: {
  defaultCategory?: string;
}) {
  return (
    <form
      action="/admin/announcements"
      className="flex flex-wrap items-end justify-between gap-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <Select
          name="category"
          defaultValue={defaultCategory ?? ""}
          className="w-40"
        >
          <option value="">전체 게시판</option>
          {announcementCategories.map((category) => (
            <option key={category} value={category}>
              {announcementCategoryLabels[category]}
            </option>
          ))}
        </Select>
        <Button type="submit" variant="secondary">
          필터
        </Button>
      </div>
      <Link href="/admin/announcements/new">
        <Button type="button">새 공지 작성</Button>
      </Link>
    </form>
  );
}
