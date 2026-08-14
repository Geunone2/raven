import { TreasurySettings } from "@/lib/db/schema";
import { updateTreasurySettings } from "@/lib/actions/treasurySettings";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export function TreasurySettingsForm({ settings }: { settings: TreasurySettings }) {
  return (
    <form action={updateTreasurySettings} className="space-y-6">
      <div className="space-y-4 rounded-md border border-edge p-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">장비 내판(경매) 정산 전용</h2>
          <p className="mt-1 text-xs text-ink-faint">
            판매 금액 → 세금 제외 → 혈비/총무비/참여보상/전투력보상 순으로 나눕니다.
          </p>
        </div>
        <FormField label="세금 (%)" htmlFor="saleTaxRate">
          <Input
            id="saleTaxRate"
            name="saleTaxRate"
            type="number"
            min="0"
            max="100"
            step="0.1"
            defaultValue={settings.saleTaxRate}
            required
          />
        </FormField>
      </div>

      <div className="space-y-4 rounded-md border border-edge p-4">
        <div>
          <h2 className="text-sm font-semibold text-ink">공통 (내판 정산 + 쟁탈전/고대성채 정산)</h2>
          <p className="mt-1 text-xs text-ink-faint">
            내판은 세후 순수익 기준, 쟁탈전/고대성채는 획득 다이아 총액 기준으로 이 비율들을
            적용합니다.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField label="혈비 (%)" htmlFor="reserveRatio">
            <Input
              id="reserveRatio"
              name="reserveRatio"
              type="number"
              min="0"
              max="100"
              step="0.1"
              defaultValue={settings.reserveRatio}
              required
            />
          </FormField>
          <FormField label="총무비 (%)" htmlFor="adminFeeRatio">
            <Input
              id="adminFeeRatio"
              name="adminFeeRatio"
              type="number"
              min="0"
              max="100"
              step="0.1"
              defaultValue={settings.adminFeeRatio}
              required
            />
          </FormField>
          <FormField label="참여 보상 (%)" htmlFor="participationRewardRatio">
            <Input
              id="participationRewardRatio"
              name="participationRewardRatio"
              type="number"
              min="0"
              max="100"
              step="0.1"
              defaultValue={settings.participationRewardRatio}
              required
            />
          </FormField>
          <FormField label="전투력 보상 (%)" htmlFor="powerRewardRatio">
            <Input
              id="powerRewardRatio"
              name="powerRewardRatio"
              type="number"
              min="0"
              max="100"
              step="0.1"
              defaultValue={settings.powerRewardRatio}
              required
            />
          </FormField>
        </div>
        <p className="text-xs text-ink-faint">
          내판 정산은 (세금 제외 후) 혈비+총무비+참여보상+전투력보상이 100%가 되도록 맞춰야 잔여금
          없이 딱 나눠집니다. 합이 100%보다 작으면 남는 만큼 길드 통장에 잔여금으로 쌓이고, 크면
          모자란 만큼 통장에서 덜 쌓입니다.
        </p>
      </div>

      <div className="flex justify-end">
        <Button type="submit">저장</Button>
      </div>
    </form>
  );
}
