import { GuildMember } from "@/lib/db/schema";

export function MemberBankOverviewCard({
  rows,
}: {
  rows: { member: GuildMember; deposit: number; withdrawal: number; balance: number }[];
}) {
  return (
    <div className="w-full rounded-xl border border-edge bg-surface p-4 shadow-md">
      <p className="text-base font-bold text-brand">길드원 통장 잔고</p>

      {rows.length === 0 ? (
        <p className="mt-3 text-sm text-ink-faint">등록된 길드원이 없습니다.</p>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-md border border-edge">
          {/* 길드/누적입금/누적출금은 태블릿부터만 보여준다(2026-08-14) —
              닉네임/잔고만 있으면 화면이 깨지지 않는다. */}
          <table className="w-full min-w-[320px] text-left text-sm md:min-w-[600px]">
            <thead className="bg-surface-raised text-ink-faint">
              <tr>
                <th className="px-4 py-3 font-medium">닉네임</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">길드</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">누적입금</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">누적출금</th>
                <th className="px-4 py-3 font-medium">잔고</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-edge">
              {rows.map(({ member, deposit, withdrawal, balance }) => (
                <tr key={member.id}>
                  <td className="px-4 py-3 font-medium text-ink">{member.nickname}</td>
                  <td className="hidden px-4 py-3 text-ink-faint md:table-cell">{member.guildName ?? "-"}</td>
                  <td className="hidden px-4 py-3 text-success md:table-cell">+{deposit.toLocaleString()}</td>
                  <td className="hidden px-4 py-3 text-danger md:table-cell">-{withdrawal.toLocaleString()}</td>
                  <td className="px-4 py-3 font-medium text-ink">{balance.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
