import { createBossTimer } from "@/lib/actions/bossTimers";
import { BossTimerForm } from "@/components/organisms/BossTimerForm";

export default function NewBossTimerPage() {
  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        보스 등록
      </h1>
      <BossTimerForm action={createBossTimer} />
    </div>
  );
}
