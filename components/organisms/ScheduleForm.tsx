import {
  ContentSchedule,
  bossTiers,
  contentTypes,
  scheduleStatuses,
  targetAudiences,
} from "@/lib/db/schema";
import {
  bossTierLabels,
  contentTypeLabels,
  scheduleStatusLabels,
  targetAudienceLabels,
} from "@/lib/constants/schedules";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
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
      <div className="grid grid-cols-2 gap-4">
        <FormField label="콘텐츠 종류" htmlFor="type">
          <Select id="type" name="type" defaultValue={schedule?.type ?? "guild_dungeon"}>
            {contentTypes.map((type) => (
              <option key={type} value={type}>
                {contentTypeLabels[type]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="제목" htmlFor="title">
          <Input id="title" name="title" defaultValue={schedule?.title} required />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="날짜" htmlFor="date">
          <Input id="date" name="date" type="date" defaultValue={schedule?.date} required />
        </FormField>
        <FormField label="집결 시간" htmlFor="gatherTime">
          <Input
            id="gatherTime"
            name="gatherTime"
            type="time"
            defaultValue={schedule?.gatherTime ?? ""}
          />
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

      <div className="grid grid-cols-3 gap-4">
        <FormField label="예상 종료 시간" htmlFor="expectedEndTime">
          <Input
            id="expectedEndTime"
            name="expectedEndTime"
            type="time"
            defaultValue={schedule?.expectedEndTime ?? ""}
          />
        </FormField>
        <FormField label="참여 대상" htmlFor="targetAudience">
          <Select
            id="targetAudience"
            name="targetAudience"
            defaultValue={schedule?.targetAudience ?? "all"}
          >
            {targetAudiences.map((audience) => (
              <option key={audience} value={audience}>
                {targetAudienceLabels[audience]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="진행 상태" htmlFor="status">
          <Select id="status" name="status" defaultValue={schedule?.status ?? "scheduled"}>
            {scheduleStatuses.map((status) => (
              <option key={status} value={status}>
                {scheduleStatusLabels[status]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="서버" htmlFor="serverName">
          <Input
            id="serverName"
            name="serverName"
            defaultValue={schedule?.serverName ?? ""}
            placeholder="예: 메투스"
          />
        </FormField>
        <FormField label="장소" htmlFor="location">
          <Input id="location" name="location" defaultValue={schedule?.location ?? ""} />
        </FormField>
        <FormField label="준비물" htmlFor="requiredItem">
          <Input
            id="requiredItem"
            name="requiredItem"
            defaultValue={schedule?.requiredItem ?? ""}
            placeholder="입장권, 물약, 버프"
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="보스 등급" htmlFor="bossTier">
          <Select id="bossTier" name="bossTier" defaultValue={schedule?.bossTier ?? "none"}>
            {bossTiers.map((tier) => (
              <option key={tier} value={tier}>
                {bossTierLabels[tier]}
              </option>
            ))}
          </Select>
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
      </div>

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
