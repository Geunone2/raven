import {
  dungeonClearResults,
  dungeonDifficulties,
  GuildDungeonRun,
  lootDistributionStatuses,
} from "@/lib/db/schema";
import {
  clearResultLabels,
  difficultyLabels,
  distributionStatusLabels,
} from "@/lib/constants/schedule/dungeonRuns";
import { FormField } from "@/components/molecules/FormField";
import { CustomSelect } from "@/components/atoms/CustomSelect";
import { Textarea } from "@/components/atoms/Textarea";
import { Button } from "@/components/atoms/Button";

export function DungeonRunForm({
  run,
  action,
}: {
  run?: GuildDungeonRun;
  action: (formData: FormData) => void;
}) {
  return (
    <form action={action} className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <FormField label="난이도" htmlFor="difficulty">
          <CustomSelect
            id="difficulty"
            name="difficulty"
            defaultValue={run?.difficulty ?? "normal"}
            options={dungeonDifficulties.map((difficulty) => ({
              value: difficulty,
              label: difficultyLabels[difficulty],
            }))}
          />
        </FormField>
        <FormField label="클리어 결과" htmlFor="clearResult">
          <CustomSelect
            id="clearResult"
            name="clearResult"
            defaultValue={run?.clearResult ?? ""}
            options={[
              { value: "", label: "미확정" },
              ...dungeonClearResults.map((result) => ({
                value: result,
                label: clearResultLabels[result],
              })),
            ]}
          />
        </FormField>
        <FormField label="분배 상태" htmlFor="distributionStatus">
          <CustomSelect
            id="distributionStatus"
            name="distributionStatus"
            defaultValue={run?.distributionStatus ?? "undistributed"}
            options={lootDistributionStatuses.map((status) => ({
              value: status,
              label: distributionStatusLabels[status],
            }))}
          />
        </FormField>
      </div>

      <FormField label="전리품" htmlFor="loot">
        <Textarea
          id="loot"
          name="loot"
          defaultValue={run?.loot ?? ""}
          rows={3}
          placeholder="도안 조각 상자 2개, 인장 상자 1개"
        />
      </FormField>

      <div className="flex justify-end pt-2">
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
