import { Announcement, announcementCategories } from "@/lib/db/schema";
import { announcementCategoryLabels } from "@/lib/constants/announcements";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function AnnouncementForm({
  announcement,
  action,
}: {
  announcement?: Announcement;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="게시판" htmlFor="category">
          <Select
            id="category"
            name="category"
            defaultValue={announcement?.category ?? "general"}
          >
            {announcementCategories.map((category) => (
              <option key={category} value={category}>
                {announcementCategoryLabels[category]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="제목" htmlFor="title">
          <Input
            id="title"
            name="title"
            defaultValue={announcement?.title}
            required
          />
        </FormField>
      </div>

      <FormField label="내용" htmlFor="content">
        <Textarea
          id="content"
          name="content"
          defaultValue={announcement?.content}
          rows={8}
          required
        />
      </FormField>

      <label className="flex items-center gap-2 text-sm text-ink-muted">
        <input
          type="checkbox"
          name="isPinned"
          defaultChecked={announcement?.isPinned}
          className="h-4 w-4"
        />
        상단 고정
      </label>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit">{announcement ? "저장" : "작성"}</Button>
      </div>
    </form>
  );
}
