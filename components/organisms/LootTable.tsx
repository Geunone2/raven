import Link from "next/link";
import { ContentSchedule, Loot } from "@/lib/db/schema";
import {
  lootGradeLabels,
  lootCategoryLabels,
  distributionMethodLabels,
} from "@/lib/constants/loots";
import { distributionStatusLabels } from "@/lib/constants/dungeonRuns";
import { Badge } from "@/components/atoms/Badge";
import { deleteLoot } from "@/lib/actions/loots";

const statusTone = {
  undistributed: "warning",
  distributing: "neutral",
  completed: "success",
} as const;

const gradeTone = {
  rare: "neutral",
  hero: "success",
  legendary: "warning",
} as const;

export function LootTable({
  rows,
}: {
  rows: { loot: Loot; schedule: ContentSchedule | null }[];
}) {
  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        등록된 전리품이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      <table className="w-full min-w-375 text-left text-sm">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">획득일</th>
            <th className="px-4 py-3 font-medium">콘텐츠</th>
            <th className="px-4 py-3 font-medium">아이템명</th>
            <th className="px-4 py-3 font-medium">등급</th>
            <th className="px-4 py-3 font-medium">아이템 정보</th>
            <th className="px-4 py-3 font-medium">획득자</th>
            <th className="px-4 py-3 font-medium">분배 방식</th>
            <th className="px-4 py-3 font-medium">판매 금액</th>
            <th className="px-4 py-3 font-medium">보관 길드</th>
            <th className="px-4 py-3 font-medium">최종 수령자</th>
            <th className="px-4 py-3 font-medium">상태</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {rows.map(({ loot, schedule }) => (
            <tr key={loot.id}>
              <td className="px-4 py-3 font-medium text-ink">
                {loot.obtainedAt}
              </td>
              <td className="px-4 py-3 text-ink-faint">
                {schedule ? schedule.title : "-"}
              </td>
              <td className="px-4 py-3">{loot.itemName}</td>
              <td className="px-4 py-3">
                <Badge tone={gradeTone[loot.grade]}>{lootGradeLabels[loot.grade]}</Badge>
              </td>
              <td className="px-4 py-3 text-ink-faint">{lootCategoryLabels[loot.category]}</td>
              <td className="px-4 py-3 text-ink-faint">{loot.obtainedBy ?? "-"}</td>
              <td className="px-4 py-3 text-ink-faint">
                {distributionMethodLabels[loot.distributionMethod]}
              </td>
              <td className="px-4 py-3 text-ink-faint">
                {loot.askingPrice != null ? loot.askingPrice.toLocaleString() : "-"}
              </td>
              <td className="px-4 py-3 text-ink-faint">{loot.custodyGuild ?? "-"}</td>
              <td className="px-4 py-3 text-ink-faint">{loot.receiver ?? "-"}</td>
              <td className="px-4 py-3">
                <Badge tone={statusTone[loot.status]}>
                  {distributionStatusLabels[loot.status]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/loots/${loot.id}`}
                    className="text-sm text-ink-muted hover:underline"
                  >
                    수정
                  </Link>
                  <form action={deleteLoot.bind(null, loot.id)}>
                    <button
                      type="submit"
                      className="text-sm text-danger hover:underline"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
