import Link from "next/link";
import {TrendingDown, TrendingUp} from "lucide-react";
import {GuildTreasuryTransaction} from "@/lib/db/schema";
import {formatMonthDayTimeUtc} from "@/lib/time";
import {RouletteText} from "@/components/atoms/RouletteText";
import {ExpenseIcon, IncomeIcon, TotalIcon} from "@/components/atoms/BankIcons";

const RECENT_INCOME_COUNT = 1;
const RECENT_EXPENSE_COUNT = 1;

const SUMMARY_TONE_CLASSES = {
    brand: "text-brand",
    success: "text-success",
    danger: "text-danger",
} as const;

const SUMMARY_ICONS = {
    brand: TotalIcon,
    success: IncomeIcon,
    danger: ExpenseIcon,
} as const;

function SummaryCard({
                         label,
                         value,
                         tone,
                         lastUpdatedAt,
                         href,
                     }: {
    label: string;
    value: number;
    tone: keyof typeof SUMMARY_TONE_CLASSES;
    lastUpdatedAt: string | null;
    href: string;
}) {
    const Icon = SUMMARY_ICONS[tone];
    return (
        <div className="min-h-32 rounded-xl border border-edge bg-surface p-4 shadow-md">
            <div className="flex items-center justify-between">
                <p className={`flex items-center gap-1.5 text-sm font-medium ${SUMMARY_TONE_CLASSES[tone]}`}>
                    <Icon className="size-4"/>
                    {label}
                </p>
                <Link href={href} className="text-xs text-ink-muted hover:underline">
                    전체보기 &gt;
                </Link>
            </div>
            <p className={`mt-1 text-2xl font-semibold ${SUMMARY_TONE_CLASSES[tone]}`}>
                <RouletteText text={value.toLocaleString()}/>
                <span className="ml-1 text-sm font-medium text-ink-muted">크리스탈</span>
            </p>
            <p className="mt-1 text-xs text-ink-faint">
                갱신일: {lastUpdatedAt ? formatMonthDayTimeUtc(lastUpdatedAt) : "-"}
            </p>
        </div>
    );
}

function TransactionList({
                             transactions,
                             amountLabel,
                         }: {
    transactions: GuildTreasuryTransaction[];
    amountLabel: string;
}) {
    if (transactions.length === 0) {
        return <p className="mt-2 text-xs text-ink-faint">내역이 없습니다.</p>;
    }

    return (
        <ul className="mt-2 max-h-64 space-y-2 overflow-y-auto">
            {transactions.map((tx) => (
                <li key={tx.id} className="flex-2 rounded-md p-1 text-xs">
                    <p className="text-ink-faint">날짜: {tx.date ?? tx.createdAt}</p>
                    <p className="font-medium text-ink">
                        {amountLabel}: {Math.abs(tx.amount).toLocaleString()} 크리스탈
                    </p>
                    <p className="text-ink-muted">사유: {tx.reason ?? "-"}</p>
                    <p className="text-ink-faint">비고: {tx.note ?? "-"}</p>
                </li>
            ))}
        </ul>
    );
}

function RecentTransactionCard({
                                   title,
                                   titleTone,
                                   transactions,
                                   amountLabel,
                               }: {
    title: string;
    titleTone: "success" | "danger";
    transactions: GuildTreasuryTransaction[];
    amountLabel: string;
}) {
    const TrendIcon = titleTone === "success" ? TrendingUp : TrendingDown;
    return (
        <div className="min-h-40 w-full rounded-xl border border-edge bg-surface p-4 shadow-md">
            <p
                className={`flex items-center gap-1.5 text-sm font-medium ${
                    titleTone === "success" ? "text-success" : "text-danger"
                }`}
            >
                <TrendIcon className="size-4"/>
                {title}
            </p>
            <TransactionList transactions={transactions} amountLabel={amountLabel}/>
        </div>
    );
}

export function GuildTreasurySummaryCard({
                                             balance,
                                             transactions,
                                         }: {
    balance: number;
    transactions: GuildTreasuryTransaction[];
}) {
    const income = transactions.filter((tx) => tx.amount > 0);
    const expense = transactions.filter((tx) => tx.amount < 0);
    const incomeTotal = income.reduce((sum, tx) => sum + tx.amount, 0);
    const expenseTotal = expense.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
    // transactions/income/expense는 모두 createdAt 기준 최신순으로 정렬된 배열에서
    // filter()로 순서를 유지한 채 뽑아낸 것이라, 각각 맨 앞이 해당 구간의 최근 거래.
    const balanceUpdatedAt = transactions[0]?.createdAt ?? null;
    const incomeUpdatedAt = income[0]?.createdAt ?? null;
    const expenseUpdatedAt = expense[0]?.createdAt ?? null;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <SummaryCard
                    label="현재 보유금"
                    value={balance}
                    tone="brand"
                    lastUpdatedAt={balanceUpdatedAt}
                    href="/bank/all"
                />
                <SummaryCard
                    label="총 수입"
                    value={incomeTotal}
                    tone="success"
                    lastUpdatedAt={incomeUpdatedAt}
                    href="/bank/income"
                />
                <SummaryCard
                    label="총 지출"
                    value={expenseTotal}
                    tone="danger"
                    lastUpdatedAt={expenseUpdatedAt}
                    href="/bank/expense"
                />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <RecentTransactionCard
                    title="최근 수입"
                    titleTone="success"
                    transactions={income.slice(0, RECENT_INCOME_COUNT)}
                    amountLabel="수입"
                />
                <RecentTransactionCard
                    title="최근 지출"
                    titleTone="danger"
                    transactions={expense.slice(0, RECENT_EXPENSE_COUNT)}
                    amountLabel="지출"
                />
            </div>
        </div>
    );
}
