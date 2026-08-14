import { ContentSchedule, bossTiers, contentTypes, SCHEDULE_TARGET_GUILDS } from "@/lib/db/schema";
import {
  ABYSS_DING_POINTS,
  bossTierLabels,
  bossTierPoints,
  contentTypeLabels,
  SERVERS,
} from "@/lib/constants/schedules";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function ScheduleForm({
  schedule,
  action,
}: {
  schedule?: ContentSchedule;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="콘텐츠 종류" htmlFor="type">
          <CustomSelect
            id="type"
            name="type"
            defaultValue={schedule?.type ?? contentTypes[0]}
            options={contentTypes.map((type) => ({
              value: type,
              label: contentTypeLabels[type],
            }))}
          />
        </FormField>
        <FormField label="제목" htmlFor="title">
          <Input id="title" name="title" defaultValue={schedule?.title} required />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="날짜" htmlFor="date">
          <Input id="date" name="date" type="date" defaultValue={schedule?.date} required />
        </FormField>
        <FormField label="시작 시간" htmlFor="startTime">
          <Input
            id="startTime"
            name="startTime"
            type="time"
            defaultValue={schedule?.startTime}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="참여 길드" htmlFor="targetGuild">
          <CustomSelect
            id="targetGuild"
            name="targetGuild"
            defaultValue={schedule?.targetGuild ?? SCHEDULE_TARGET_GUILDS[0]}
            options={SCHEDULE_TARGET_GUILDS.map((guild) => ({ value: guild, label: guild }))}
          />
        </FormField>
        <FormField label="서버" htmlFor="serverName">
          <CustomSelect
            id="serverName"
            name="serverName"
            defaultValue={schedule?.serverName ?? ""}
            options={[
              { value: "", label: "(미지정)" },
              ...SERVERS.map((server) => ({ value: server, label: server })),
            ]}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <FormField label="보스 등급" htmlFor="bossTier">
          <CustomSelect
            id="bossTier"
            name="bossTier"
            defaultValue={schedule?.bossTier ?? "none"}
            options={bossTiers.map((tier) => ({ value: tier, label: bossTierLabels[tier] }))}
          />
        </FormField>
        <div className="flex items-end pb-2">
          <label htmlFor="hasCombat" className="flex items-center gap-2 text-sm text-ink">
            <input
              id="hasCombat"
              name="hasCombat"
              type="checkbox"
              defaultChecked={schedule?.hasCombat ?? false}
              className="size-4 rounded border-edge-strong"
            />
            전투 포함 여부
          </label>
        </div>
        <FormField label="전투 시간 (시간)" htmlFor="combatHours">
          <Input
            id="combatHours"
            name="combatHours"
            type="number"
            min="0"
            step="0.5"
            defaultValue={schedule?.combatHours ?? ""}
            placeholder="전투 포함 시에만 반영"
          />
        </FormField>
        <div className="flex items-end pb-2">
          <label htmlFor="hasAbyssDing" className="flex items-center gap-2 text-sm text-ink">
            <input
              id="hasAbyssDing"
              name="hasAbyssDing"
              type="checkbox"
              defaultChecked={schedule?.hasAbyssDing ?? false}
              className="size-4 rounded border-edge-strong"
            />
            어비스 띵 (+{ABYSS_DING_POINTS}점)
          </label>
        </div>
      </div>

      <FormField label="보스 기여도 점수" htmlFor="bossPoints">
        <Input
          id="bossPoints"
          name="bossPoints"
          type="number"
          min="0"
          step="0.5"
          defaultValue={schedule?.bossPoints ?? ""}
          placeholder="비우면 자동 계산"
          className="max-w-40"
        />
        <p className="mt-1 text-xs text-ink-faint">
          비우면 보스 등급 기준(3성 {bossTierPoints.star3}점 · 4성 {bossTierPoints.star4}점 ·
          5성 {bossTierPoints.star5}점 · 어비스보스 {bossTierPoints.abyss_boss}점)으로 자동
          계산되고, 값을 입력하면 그 점수가 우선 적용됩니다. 중간합류자는 이 점수의 절반을
          받습니다.
        </p>
      </FormField>

      <FormField label="공지 문구" htmlFor="noticeText">
        <Textarea
          id="noticeText"
          name="noticeText"
          defaultValue={schedule?.noticeText ?? ""}
          rows={4}
          placeholder="카카오톡/디스코드에 붙여넣을 공지 문구"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit">{schedule ? "저장" : "등록"}</Button>
      </div>
    </form>
  );
}
