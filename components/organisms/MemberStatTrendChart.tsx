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
import { formatMonthDayTimeUtc } from "@/lib/time";

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

  const data = history.map((h) => ({
    label: formatMonthDayTimeUtc(h.recordedAt),
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
