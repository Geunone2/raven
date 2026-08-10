import { ContentSchedule } from "@/lib/db/schema";
import { contentTypeLabels } from "@/lib/constants/schedules";
import { settleContentReward } from "@/lib/actions/contentRewards";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

export function ContentRewardSettlementPanel({ schedules }: { schedules: ContentSchedule[] }) {
  if (schedules.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-ink-faint">
        정산 대기 중인 고대성채/쟁탈전 일정이 없습니다.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-edge rounded-md border border-edge">
      {schedules.map((schedule) => (
        <li key={schedule.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
          <div>
            <p className="font-medium text-ink">
              [{contentTypeLabels[schedule.type]}] {schedule.title}
            </p>
            <p className="text-ink-faint">{schedule.date}</p>
          </div>
          <form
            action={settleContentReward.bind(null, schedule.id)}
            className="flex items-center gap-2"
          >
            <Input
              type="number"
              name="totalDia"
              min="1"
              placeholder="획득 다이아"
              className="w-32"
              required
            />
            <Button type="submit" size="md">
              정산 실행
            </Button>
          </form>
        </li>
      ))}
    </ul>
  );
}
