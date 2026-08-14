import { notFound } from "next/navigation";
import { getBossTimer, updateBossTimer, recordBossKill } from "@/lib/actions/boss-timer/bossTimers";
import { BossTimerForm } from "@/components/organisms/boss-timer/BossTimerForm";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";
import { formatFullDateTime } from "@/lib/time";

export default async function EditBossTimerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const boss = await getBossTimer(Number(id));

  if (!boss) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          보스 수정
        </h1>
      </div>
      <BossTimerForm boss={boss} action={updateBossTimer.bind(null, boss.id)} />

      {boss.type === "respawn" && (
        <div className="border-t border-edge pt-6">
          <h2 className="mb-3 text-sm font-medium text-ink">처치 시각 기록</h2>
          <form action={recordBossKill.bind(null, boss.id)} className="flex items-end gap-3">
            <FormField label="처치 시각 (비우면 현재 시각)" htmlFor="lastKilledAt">
              <Input id="lastKilledAt" name="lastKilledAt" type="datetime-local" />
            </FormField>
            <Button type="submit" variant="secondary">
              기록
            </Button>
          </form>
          {boss.lastKilledAt && (
            <p className="mt-2 text-sm text-ink-faint">
              마지막 처치: {formatFullDateTime(boss.lastKilledAt)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
