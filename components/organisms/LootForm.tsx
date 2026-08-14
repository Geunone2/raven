import {
  distributionMethods,
  Loot,
  lootCategories,
  lootDistributionStatuses,
  lootGrades,
} from "@/lib/db/schema";
import {
  distributionMethodLabels,
  lootCategoryLabels,
  lootGradeLabels,
} from "@/lib/constants/loots";
import { distributionStatusLabels } from "@/lib/constants/dungeonRuns";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function LootForm({
  loot,
  action,
}: {
  loot?: Loot;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <FormField label="아이템명" htmlFor="itemName">
          <Input id="itemName" name="itemName" defaultValue={loot?.itemName} required />
        </FormField>
        <FormField label="획득일" htmlFor="obtainedAt">
          <Input
            id="obtainedAt"
            name="obtainedAt"
            type="date"
            defaultValue={loot?.obtainedAt}
            required
          />
        </FormField>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormField label="등급" htmlFor="grade">
          <CustomSelect
            id="grade"
            name="grade"
            defaultValue={loot?.grade ?? "rare"}
            options={lootGrades.map((grade) => ({ value: grade, label: lootGradeLabels[grade] }))}
          />
        </FormField>
        <FormField label="아이템 정보" htmlFor="category">
          <CustomSelect
            id="category"
            name="category"
            defaultValue={loot?.category ?? "other"}
            options={lootCategories.map((category) => ({
              value: category,
              label: lootCategoryLabels[category],
            }))}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="판매 금액" htmlFor="askingPrice">
          <Input
            id="askingPrice"
            name="askingPrice"
            type="number"
            min={0}
            defaultValue={loot?.askingPrice ?? ""}
          />
        </FormField>
        <FormField label="보관 길드" htmlFor="custodyGuild">
          <Input
            id="custodyGuild"
            name="custodyGuild"
            defaultValue={loot?.custodyGuild ?? ""}
            placeholder="예: 리더1"
          />
        </FormField>
        <FormField label="입찰 마감 기간" htmlFor="bidDeadline">
          <Input
            id="bidDeadline"
            name="bidDeadline"
            type="datetime-local"
            defaultValue={loot?.bidDeadline ?? ""}
          />
        </FormField>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <FormField label="분배 방식" htmlFor="distributionMethod">
          <CustomSelect
            id="distributionMethod"
            name="distributionMethod"
            defaultValue={loot?.distributionMethod ?? "officer_assigned"}
            options={distributionMethods.map((method) => ({
              value: method,
              label: distributionMethodLabels[method],
            }))}
          />
        </FormField>
        <FormField label="최종 수령자 (낙찰자)" htmlFor="receiver">
          <Input id="receiver" name="receiver" defaultValue={loot?.receiver ?? ""} />
        </FormField>
        <FormField label="분배 상태" htmlFor="status">
          <CustomSelect
            id="status"
            name="status"
            defaultValue={loot?.status ?? "undistributed"}
            options={lootDistributionStatuses.map((status) => ({
              value: status,
              label: distributionStatusLabels[status],
            }))}
          />
        </FormField>
      </div>

      <FormField label="비고" htmlFor="note">
        <Textarea
          id="note"
          name="note"
          defaultValue={loot?.note ?? ""}
          rows={3}
          placeholder="분쟁 방지용 메모"
        />
      </FormField>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="submit">{loot ? "저장" : "등록"}</Button>
      </div>
    </form>
  );
}
