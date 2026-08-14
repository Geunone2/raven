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
import { GuildTreasuryTransaction } from "@/lib/db/schema";

export function TreasuryTransactionChart({
  transactions,
  color,
}: {
  transactions: GuildTreasuryTransaction[];
  color: "success" | "danger";
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-edge bg-surface text-sm text-ink-faint shadow-md">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  // 최신순으로 들어오는 배열을 시간 흐름대로(오래된 것 → 최근) 뒤집은 뒤, 각 시점까지의
  // 누적 합계를 계산해 "누적 추이" 그래프 데이터로 만든다.
  const data = [...transactions].reverse().reduce<
    { label: string; amount: number; reason: string }[]
  >((acc, tx) => {
    const previousTotal = acc.length > 0 ? acc[acc.length - 1].amount : 0;
    acc.push({
      label: tx.date ?? tx.createdAt.slice(5, 10),
      amount: previousTotal + Math.abs(tx.amount),
      reason: tx.reason ?? "-",
    });
    return acc;
  }, []);

  const lineColor = color === "success" ? "var(--color-success)" : "var(--color-danger)";

  return (
    <div className="h-64 w-full rounded-xl border border-edge bg-surface p-4 shadow-md">
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
            width={64}
          />
          <Tooltip
            formatter={(value) => [`${Number(value).toLocaleString()} 크리스탈`, "누적 금액"]}
            labelFormatter={(label, payload) => {
              const reason = (payload?.[0]?.payload as { reason?: string } | undefined)?.reason;
              return reason ? `${label} · ${reason}` : label;
            }}
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-edge)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Line
            type="monotone"
            dataKey="amount"
            stroke={lineColor}
            strokeWidth={2}
            dot={{ r: 3, fill: lineColor }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
