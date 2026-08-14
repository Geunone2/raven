"use client";

import { useActionState, useEffect } from "react";
import { GuildMember, characterTypes } from "@/lib/db/schema";
import {
  CLASS_NAMES,
  GUILD_NAMES,
  UpdateStatsResult,
  characterTypeLabels,
  isStatsStale,
} from "@/lib/constants/member/members";
import { SERVERS } from "@/lib/constants/schedule/schedules";
import { formatMonthDay } from "@/lib/time";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Button } from "@/components/atoms/Button";
import { useToast } from "@/components/atoms/ToastProvider";

export function SelfProfileForm({
  member,
  action,
}: {
  member: GuildMember;
  action: (prevState: UpdateStatsResult, formData: FormData) => Promise<UpdateStatsResult>;
}) {
  const { showToast } = useToast();
  const [state, formAction, isPending] = useActionState(action, null);

  useEffect(() => {
    if (state) showToast(state.message, state.ok ? "success" : "danger");
  }, [state, showToast]);

  return (
    <div className="space-y-6">
      {isStatsStale(member.statsUpdatedAt) && (
        <p className="rounded-md border border-warning bg-warning/15 px-4 py-3 text-sm text-warning">
          {member.statsUpdatedAt
            ? `전투력을 마지막으로 입력한 지 7일이 지났습니다 (${formatMonthDay(
                member.statsUpdatedAt
              )} 입력). 최신 정보로 다시 입력해주세요.`
            : "전투력 갱신 기록이 없습니다. 최신 정보로 입력해주세요."}
        </p>
      )}

      <div className="text-sm">
        <p className="text-ink-faint">닉네임</p>
        <p className="font-medium text-ink">
          {member.nickname}
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="grid grid-cols-4 gap-4">
          <FormField label="길드명" htmlFor="guildName">
            <CustomSelect
              id="guildName"
              name="guildName"
              defaultValue={member.guildName ?? GUILD_NAMES[0]}
              options={GUILD_NAMES.map((name) => ({ value: name, label: name }))}
            />
          </FormField>
          <FormField label="서버" htmlFor="server">
            <CustomSelect
              id="server"
              name="server"
              defaultValue={member.server ?? SERVERS[0]}
              options={SERVERS.map((name) => ({ value: name, label: name }))}
            />
          </FormField>
          <FormField label="클래스" htmlFor="className">
            <CustomSelect
              id="className"
              name="className"
              defaultValue={member.className || CLASS_NAMES[0]}
              options={CLASS_NAMES.map((name) => ({ value: name, label: name }))}
            />
          </FormField>
          <FormField label="본캐/부캐" htmlFor="characterType">
            <CustomSelect
              id="characterType"
              name="characterType"
              defaultValue={member.characterType}
              options={characterTypes.map((type) => ({
                value: type,
                label: characterTypeLabels[type],
              }))}
            />
          </FormField>
        </div>
        <div className="grid grid-cols-4 gap-4">
          <FormField label="레벨" htmlFor="level">
            <Input id="level" name="level" type="number" defaultValue={member.level} required />
          </FormField>
          <FormField label="공격력" htmlFor="attack">
            <Input id="attack" name="attack" type="number" defaultValue={member.attack} required />
          </FormField>
          <FormField label="방어력" htmlFor="defense">
            <Input id="defense" name="defense" type="number" defaultValue={member.defense} required />
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
        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isPending}>
            저장
          </Button>
        </div>
      </form>
    </div>
  );
}
