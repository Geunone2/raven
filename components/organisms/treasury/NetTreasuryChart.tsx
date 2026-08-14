"use client";

import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { GuildTreasuryTransaction } from "@/lib/db/schema";

function dateKeyOf(tx: GuildTreasuryTransaction): string {
  return tx.date ?? tx.createdAt.slice(0, 10);
}

export function NetTreasuryChart({
  transactions,
}: {
  transactions: GuildTreasuryTransaction[];
}) {
  if (transactions.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-xl border border-edge bg-surface text-sm text-ink-faint shadow-md">
        표시할 데이터가 없습니다.
      </div>
    );
  }

  const sorted = [...transactions].sort((a, b) => {
    const keyA = dateKeyOf(a);
    const keyB = dateKeyOf(b);
    if (keyA !== keyB) return keyA < keyB ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });

  let runningBalance = 0;
  const byDate = new Map<
    string,
    { label: string; net: number; income: number; expense: number; balance: number }
  >();
  for (const tx of sorted) {
    const key = dateKeyOf(tx);
    runningBalance += tx.amount;
    const entry = byDate.get(key) ?? { label: key, net: 0, income: 0, expense: 0, balance: 0 };
    entry.net += tx.amount;
    entry.balance = runningBalance;
    byDate.set(key, entry);
  }
  // 순증감(net)이 양수면 그날은 "수입"으로, 음수면 "지출"로만 막대를 채운다 —
  // 하루당 막대 하나만 보이면서도 항상 0 이상 값만 쓰므로 음수가 나타나지 않는다.
  for (const entry of byDate.values()) {
    if (entry.net >= 0) {
      entry.income = entry.net;
    } else {
      entry.expense = Math.abs(entry.net);
    }
  }
  const data = [...byDate.values()];

  return (
    <div className="h-72 w-full rounded-xl border border-edge bg-surface p-4 shadow-md">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--color-edge)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
            axisLine={{ stroke: "var(--color-edge-strong)" }}
            tickLine={false}
          />
          <YAxis
            yAxisId="flow"
            tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
            axisLine={{ stroke: "var(--color-edge-strong)" }}
            tickLine={false}
            tickFormatter={(value: number) => value.toLocaleString()}
            width={64}
          />
          <YAxis
            yAxisId="balance"
            orientation="right"
            tick={{ fontSize: 11, fill: "var(--color-ink-faint)" }}
            axisLine={{ stroke: "var(--color-edge-strong)" }}
            tickLine={false}
            tickFormatter={(value: number) => value.toLocaleString()}
            width={64}
          />
          <Tooltip
            formatter={(value, name) => [`${Number(value).toLocaleString()} 크리스탈`, name]}
            contentStyle={{
              backgroundColor: "var(--color-surface)",
              border: "1px solid var(--color-edge)",
              borderRadius: 8,
              fontSize: 12,
            }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar yAxisId="flow" dataKey="income" name="당일 수입" fill="var(--color-success)" radius={[3, 3, 0, 0]} />
          <Bar yAxisId="flow" dataKey="expense" name="당일 지출" fill="var(--color-danger)" radius={[3, 3, 0, 0]} />
          <Line
            yAxisId="balance"
            type="monotone"
            dataKey="balance"
            name="현재 보유금"
            stroke="var(--color-brand)"
            strokeWidth={2}
            dot={{ r: 2, fill: "var(--color-brand)" }}
            activeDot={{ r: 5 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
