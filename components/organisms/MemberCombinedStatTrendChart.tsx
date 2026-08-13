"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { MemberStatHistory } from "@/lib/db/schema";
import { formatMonthDay } from "@/lib/time";
import { groupByLocalDay, MAX_DAYS } from "@/components/organisms/MemberStatTrendChart";

const SERIES = [
  { key: "total", label: "종합", color: "var(--color-rank-total)" },
  { key: "attack", label: "공격력", color: "var(--color-rank-attack)" },
  { key: "defense", label: "방어력", color: "var(--color-rank-defense)" },
  { key: "accuracy", label: "명중", color: "var(--color-rank-accuracy)" },
] as const;

// "종합 추이" — 개별 MemberStatTrendChart 4개(종합/공격력/방어력/명중)를 한
// 그래프에 겹쳐서 비교할 수 있게 한 버전. 일별 집계(하루 마지막 값)/최근
// 7일 제한 규칙은 MemberStatTrendChart와 완전히 동일하므로 그쪽 헬퍼를
// 그대로 재사용한다.
export function MemberCombinedStatTrendChart({ history }: { history: MemberStatHistory[] }) {
  if (history.length === 0) {
    return (
      <div className="flex h-72 flex-col rounded-xl border border-edge bg-surface p-4 shadow-md">
        <p className="text-sm font-medium text-ink-muted">종합 추이</p>
        <div className="flex flex-1 items-center justify-center text-sm text-ink-faint">
          추이 데이터가 없습니다.
        </div>
      </div>
    );
  }

  const dailyHistory = groupByLocalDay(history).slice(-MAX_DAYS);
  const data = dailyHistory.map((h) => ({
    label: formatMonthDay(h.recordedAt),
    total: h.attack + h.defense + h.accuracy,
    attack: h.attack,
    defense: h.defense,
    accuracy: h.accuracy,
  }));

  return (
    <div className="h-72 w-full rounded-xl border border-edge bg-surface p-4 shadow-md">
      <p className="text-sm font-medium text-ink-muted">종합 추이</p>
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
              formatter={(value, name) => [
                Number(value).toLocaleString(),
                SERIES.find((s) => s.key === name)?.label ?? name,
              ]}
              contentStyle={{
                backgroundColor: "var(--color-surface)",
                border: "1px solid var(--color-edge)",
                borderRadius: 8,
                fontSize: 12,
              }}
            />
            <Legend
              formatter={(value) => SERIES.find((s) => s.key === value)?.label ?? value}
              wrapperStyle={{ fontSize: 12 }}
            />
            {SERIES.map((series) => (
              <Line
                key={series.key}
                type="monotone"
                dataKey={series.key}
                name={series.key}
                stroke={series.color}
                strokeWidth={2}
                dot={{ r: 3, fill: series.color }}
                activeDot={{ r: 5 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
