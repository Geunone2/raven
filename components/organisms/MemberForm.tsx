import { GuildMember, guildMemberRoles } from "@/lib/db/schema";
import { roleLabels } from "@/lib/constants/members";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function MemberForm({
  member,
  action,
}: {
  member: GuildMember;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="닉네임" htmlFor="nickname">
          <Input
            id="nickname"
            name="nickname"
            defaultValue={member.nickname}
            required
          />
        </FormField>
        <FormField label="클래스" htmlFor="className">
          <Input
            id="className"
            name="className"
            defaultValue={member.className}
            required
          />
        </FormField>
      </div>

      <FormField label="길드명" htmlFor="guildName">
        <Input
          id="guildName"
          name="guildName"
          defaultValue={member.guildName ?? ""}
          placeholder="리더1, 리더2 등"
        />
      </FormField>

      <div className="grid grid-cols-4 gap-4">
        <FormField label="레벨" htmlFor="level">
          <Input
            id="level"
            name="level"
            type="number"
            defaultValue={member.level}
            required
          />
        </FormField>
        <FormField label="공격력" htmlFor="attack">
          <Input
            id="attack"
            name="attack"
            type="number"
            defaultValue={member.attack}
            required
          />
        </FormField>
        <FormField label="방어력" htmlFor="defense">
          <Input
            id="defense"
            name="defense"
            type="number"
            defaultValue={member.defense}
            required
          />
        </FormField>
        <FormField label="명중" htmlFor="accuracy">
          <Input
            id="accuracy"
            name="accuracy"
            type="number"
            defaultValue={member.accuracy}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="직책" htmlFor="role">
          <Select id="role" name="role" defaultValue={member.role}>
            {guildMemberRoles.map((role) => (
              <option key={role} value={role}>
                {roleLabels[role]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="최근 접속일" htmlFor="lastLoginAt">
          <Input
            id="lastLoginAt"
            name="lastLoginAt"
            type="date"
            defaultValue={member.lastLoginAt ?? ""}
          />
        </FormField>
      </div>

      <FormField label="메모" htmlFor="memo">
        <Textarea id="memo" name="memo" defaultValue={member.memo ?? ""} rows={3} />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
