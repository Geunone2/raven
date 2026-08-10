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
} from "@/lib/constants/dungeonRuns";
import { FormField } from "@/components/molecules/FormField";
import { Select } from "@/components/atoms/Select";
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
      <div className="grid grid-cols-3 gap-4">
        <FormField label="난이도" htmlFor="difficulty">
          <Select id="difficulty" name="difficulty" defaultValue={run?.difficulty ?? "normal"}>
            {dungeonDifficulties.map((difficulty) => (
              <option key={difficulty} value={difficulty}>
                {difficultyLabels[difficulty]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="클리어 결과" htmlFor="clearResult">
          <Select id="clearResult" name="clearResult" defaultValue={run?.clearResult ?? ""}>
            <option value="">미확정</option>
            {dungeonClearResults.map((result) => (
              <option key={result} value={result}>
                {clearResultLabels[result]}
              </option>
            ))}
          </Select>
        </FormField>
        <FormField label="분배 상태" htmlFor="distributionStatus">
          <Select
            id="distributionStatus"
            name="distributionStatus"
            defaultValue={run?.distributionStatus ?? "undistributed"}
          >
            {lootDistributionStatuses.map((status) => (
              <option key={status} value={status}>
                {distributionStatusLabels[status]}
              </option>
            ))}
          </Select>
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
