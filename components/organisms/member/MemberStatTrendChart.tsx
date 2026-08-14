"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MemberStatHistory } from "@/lib/db/schema";
import { formatDateOnly, formatMonthDay } from "@/lib/time";

// MemberCombinedStatTrendChart.tsx(종합 추이 — 4개 지표를 한 그래프에)도
// 동일한 일별 집계 규칙을 쓰므로 같이 export한다.
export const MAX_DAYS = 7;

// recordedAt(UTC 타임스탬프)을 KST 달력 날짜로 묶기 위한 키(표시는 formatMonthDay로
// 따로, 연도 없이). 예전엔 로컬 getter를 써서 서버(UTC)와 브라우저(KST)가 자정~
// 오전 9시(KST) 사이엔 다른 날짜로 묶는 문제가 있었다(2026-08-15 수정).
const localDateKey = formatDateOnly;

// 같은 날 여러 번 입력했으면 그날의 마지막 값만 남기고 하루 단위로 묶는다.
// history는 recordedAt 오름차순으로 들어오므로, 각 날짜 키에 마지막으로
// set()된 값이 자연스럽게 "그날의 최신 입력"이 되고 Map의 키 순서(=최초
// 등장 순서)는 그대로 날짜 오름차순을 유지한다.
export function groupByLocalDay(history: MemberStatHistory[]): MemberStatHistory[] {
  const byDay = new Map<string, MemberStatHistory>();
  for (const entry of history) {
    byDay.set(localDateKey(entry.recordedAt), entry);
  }
  return [...byDay.values()];
}

export function MemberStatTrendChart({
  title,
  history,
  dataKey,
  color,
}: {
  title: string;
  history: MemberStatHistory[];
  dataKey: "attack" | "defense" | "accuracy" | "total";
  color: string;
}) {
  if (history.length === 0) {
    return (
      <div className="flex h-56 flex-col rounded-xl border border-edge bg-surface p-4 shadow-md">
        <p className="text-sm font-medium text-ink-muted">{title}</p>
        <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
          추이 데이터가 없습니다.
        </div>
      </div>
    );
  }

  // 최근 7일치 일별 값만 보여준다 — 하루에 여러 번 입력해도 그날 마지막
  // 값 하나로 집계.
  const dailyHistory = groupByLocalDay(history).slice(-MAX_DAYS);
  const data = dailyHistory.map((h) => ({
    label: formatMonthDay(h.recordedAt),
    value: dataKey === "total" ? h.attack + h.defense + h.accuracy : h[dataKey],
  }));

  return (
    <div className="h-56 w-full rounded-xl border border-edge bg-surface p-4 shadow-md">
      <p className="text-sm font-medium text-ink-muted">{title}</p>
      <div className="h-[calc(100%-1.5rem)]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
              axisLine={{ stroke: "var(--color-edge-strong)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
              axisLine={{ stroke: "var(--color-edge-strong)" }}
              tickLine={false}
              tickFormatter={(value: number) => value.toLocaleString()}
              width={56}
            />
            <Tooltip
              formatter={(value) => [Number(value).toLocaleString(), title]}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-edge)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={{ r: 3, fill: color }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
