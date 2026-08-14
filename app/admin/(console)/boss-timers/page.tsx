import Link from "next/link";
import { getBossTimers } from "@/lib/actions/boss-timer/bossTimers";
import { BossTimerTable } from "@/components/organisms/boss-timer/BossTimerTable";
import { Button } from "@/components/atoms/Button";

export default async function BossTimersPage() {
  const bosses = await getBossTimers();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-ink">
          보스 타이머
        </h1>
        <Link href="/admin/boss-timers/new">
          <Button type="button">보스 등록</Button>
        </Link>
      </div>
      <BossTimerTable bosses={bosses} />
    </div>
  );
}
