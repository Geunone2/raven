import Link from "next/link";
import { announcementCategories } from "@/lib/db/schema";
import { announcementCategoryLabels } from "@/lib/constants/announcements";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Button } from "@/components/atoms/Button";

const SORT_OPTIONS = [
  { value: "desc", label: "최신순" },
  { value: "asc", label: "오래된순" },
];

export function AnnouncementFilterBar({
  defaultCategory,
  defaultSort = "desc",
}: {
  defaultCategory?: string;
  defaultSort?: "asc" | "desc";
}) {
  return (
    <form
      action="/admin/announcements"
      className="flex flex-wrap items-end justify-between gap-3"
    >
      <div className="flex flex-wrap items-end gap-3">
        <CustomSelect
          name="category"
          defaultValue={defaultCategory ?? ""}
          className="w-40"
          options={[
            { value: "", label: "전체 게시판" },
            ...announcementCategories.map((category) => ({
              value: category,
              label: announcementCategoryLabels[category],
            })),
          ]}
        />
        <CustomSelect
          name="sort"
          defaultValue={defaultSort}
          className="w-32"
          options={SORT_OPTIONS}
        />
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
