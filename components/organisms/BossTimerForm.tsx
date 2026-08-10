import { BossTimer, bossTimerTypes } from "@/lib/db/schema";
import { bossTimerTypeLabels } from "@/lib/constants/bossTimers";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function BossTimerForm({
  boss,
  action,
}: {
  boss?: BossTimer;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="보스명" htmlFor="name">
          <Input id="name" name="name" defaultValue={boss?.name} required />
        </FormField>
        <FormField label="종류" htmlFor="type">
          <Select id="type" name="type" defaultValue={boss?.type ?? "fixed"}>
            {bossTimerTypes.map((type) => (
              <option key={type} value={type}>
                {bossTimerTypeLabels[type]}
              </option>
            ))}
          </Select>
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="고정 출현 시각 (고정 시간 / 어비스 타입)" htmlFor="fixedTime">
          <Input id="fixedTime" name="fixedTime" type="time" defaultValue={boss?.fixedTime ?? ""} />
        </FormField>
        <FormField label="리젠 주기 - 분 (리젠 타이머 타입)" htmlFor="respawnMinutes">
          <Input
            id="respawnMinutes"
            name="respawnMinutes"
            type="number"
            defaultValue={boss?.respawnMinutes ?? ""}
          />
        </FormField>
      </div>

      <FormField label="메모" htmlFor="memo">
        <Textarea id="memo" name="memo" defaultValue={boss?.memo ?? ""} rows={3} />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit">{boss ? "저장" : "등록"}</Button>
      </div>
    </form>
  );
}
