import { GuildMember } from "@/lib/db/schema";
import { SERVERS } from "@/lib/constants/schedules";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Textarea } from "@/components/atoms/Textarea";

// id="member-edit-form"으로 폼 자체엔 저장 버튼을 두지 않는다 — 페이지 쪽에서
// 전투력 추이 그래프 아래에 <button form="member-edit-form"> 형태로 따로
// 배치한다(이 폼의 유일한 사용처가 그 페이지라 안전하게 분리 가능).
export function MemberForm({
  member,
  action,
}: {
  member: GuildMember;
  action: (formData: FormData) => void;
}) {
  return (
    <form id="member-edit-form" action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="길드명" htmlFor="guildName">
          <Input
            id="guildName"
            name="guildName"
            defaultValue={member.guildName ?? ""}
            placeholder="리더1, 리더2 등"
          />
        </FormField>
        <FormField label="서버" htmlFor="server">
          <CustomSelect
            id="server"
            name="server"
            defaultValue={member.server ?? ""}
            options={[
              { value: "", label: "(미지정)" },
              ...SERVERS.map((server) => ({ value: server, label: server })),
            ]}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      <FormField label="참여도 점수 보정" htmlFor="participationPointsAdjustment">
        <Input
          id="participationPointsAdjustment"
          name="participationPointsAdjustment"
          type="number"
          step="1"
          defaultValue={member.participationPointsAdjustment}
          className="max-w-40"
        />
        <p className="mt-1 text-xs text-ink-faint">
          참여 체크 자동 합산 점수 위에 더하거나 뺄 보정값입니다. 음수도 입력할 수 있습니다.
        </p>
      </FormField>

      <FormField label="메모" htmlFor="memo">
        <Textarea id="memo" name="memo" defaultValue={member.memo ?? ""} rows={3} />
      </FormField>
    </form>
  );
}
