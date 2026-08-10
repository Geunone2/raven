import { guildMemberRoles } from "@/lib/db/schema";
import { roleLabels } from "@/lib/constants/members";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Button } from "@/components/atoms/Button";

export function MemberFilterBar({
  defaultQuery,
  defaultRole,
}: {
  defaultQuery?: string;
  defaultRole?: string;
}) {
  return (
    <form action="/admin/members" className="flex flex-wrap items-end gap-3">
      <Input
        name="q"
        placeholder="닉네임 검색"
        defaultValue={defaultQuery}
        className="w-48"
      />
      <Select name="role" defaultValue={defaultRole ?? ""} className="w-40">
        <option value="">전체 직책</option>
        {guildMemberRoles.map((role) => (
          <option key={role} value={role}>
            {roleLabels[role]}
          </option>
        ))}
      </Select>
      <Button type="submit" variant="secondary">
        검색
      </Button>
    </form>
  );
}
