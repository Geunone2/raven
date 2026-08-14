function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "danger";
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-muted">{label}</span>
      <span className={`font-medium ${tone === "success" ? "text-success" : "text-danger"}`}>
        {value}
      </span>
    </div>
  );
}

export function MyBankSummaryCard({
  balance,
  deposit,
  withdrawal,
}: {
  balance: number;
  deposit: number;
  withdrawal: number;
}) {
  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md">
      <p className="text-base font-bold text-brand">내 통장</p>

      <div className="mt-4 space-y-1.5">
        <Row label="누적 입금" value={`+${deposit.toLocaleString()}`} tone="success" />
        <Row label="누적 출금" value={`-${withdrawal.toLocaleString()}`} tone="danger" />
      </div>

      <div className="mt-4 flex items-end justify-between border-t border-edge pt-3">
        <span className="text-sm font-medium text-ink">잔고</span>
        <span className="text-2xl font-bold text-brand">
          {balance.toLocaleString()}
          <span className="ml-1 text-sm font-medium text-ink-muted">크리스탈</span>
        </span>
      </div>
    </div>
  );
}
