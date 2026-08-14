import { notFound } from "next/navigation";
import { getBankBalance, getBankTransactions, createBankTransaction } from "@/lib/actions/treasury/bank";
import { getMember } from "@/lib/actions/member/members";
import { BankAdjustForm } from "@/components/organisms/treasury/BankAdjustForm";
import { BankTransactionTable } from "@/components/organisms/treasury/BankTransactionTable";

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
    // 거래 내역 표(BankTransactionTable)는 min-w-[700px]인데 예전엔 이 페이지
    // 전체를 max-w-2xl(672px)로 좁혀놔서, 표가 자기 폭보다 좁은 상자 안에 갇혀
    // 메모 칼럼이 화면 밖으로 밀려나 있었다(2026-08-14) — 다른 어드민 표 페이지
    // (loots/members 등)처럼 폭 제한을 없애 표가 그대로 들어가게 한다.
    <div className="space-y-8">
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
