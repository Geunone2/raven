import { getTreasurySettings } from "@/lib/actions/treasurySettings";
import { TreasurySettingsForm } from "@/components/organisms/TreasurySettingsForm";

export default async function AdminSettingsPage() {
  const settings = await getTreasurySettings();

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          정산 설정
        </h1>
        <p className="mt-1 text-sm text-ink-faint">
          장비 내판(경매) 정산과 쟁탈전/고대성채 보상 정산이 함께 쓰는 비율입니다. 저장하면 다음
          정산부터 바로 반영됩니다 — 이미 완료된 정산에는 영향을 주지 않습니다.
        </p>
      </div>
      <TreasurySettingsForm settings={settings} />
    </div>
  );
}
