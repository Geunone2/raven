import { notFound } from "next/navigation";
import { getBankBalance, getBankTransactions, createBankTransaction } from "@/lib/actions/bank";
import { getMember } from "@/lib/actions/members";
import { BankAdjustForm } from "@/components/organisms/BankAdjustForm";
import { BankTransactionTable } from "@/components/organisms/BankTransactionTable";

export default async function MemberBankPage({
  params,
}: {
  params: Promise<{ memberId: string }>;
}) {
  const { memberId } = await params;
  const id = Number(memberId);
  const member = await getMember(id);

  if (!member) {
    notFound();
  }

  const [balance, transactions] = await Promise.all([
    getBankBalance(id),
    getBankTransactions(id),
  ]);

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-ink">
          {member.nickname}님의 통장
        </h1>
        <p className="mt-1 text-2xl font-semibold text-brand">
          {balance.toLocaleString()}
        </p>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink">거래 기록</h2>
        <BankAdjustForm action={createBankTransaction.bind(null, id)} />
      </div>

      <div>
        <h2 className="mb-3 text-sm font-medium text-ink">거래 내역</h2>
        <BankTransactionTable transactions={transactions} />
      </div>
    </div>
  );
}
