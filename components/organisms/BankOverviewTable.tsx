import Link from "next/link";
import { GuildMember } from "@/lib/db/schema";

export function BankOverviewTable({
  rows,
}: {
  rows: { member: GuildMember; balance: number }[];
}) {
  if (rows.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        등록된 길드원이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      <table className="w-full min-w-[700px] text-left text-sm">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">닉네임</th>
            <th className="px-4 py-3 font-medium">길드명</th>
            <th className="px-4 py-3 font-medium">잔액</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {rows.map(({ member, balance }) => (
            <tr key={member.id}>
              <td className="px-4 py-3 font-medium text-ink">{member.nickname}</td>
              <td className="px-4 py-3 text-ink-faint">{member.guildName ?? "-"}</td>
              <td className="px-4 py-3 font-medium text-ink">
                {balance.toLocaleString()}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end">
                  <Link
                    href={`/admin/bank/${member.id}`}
                    className="text-sm text-ink-muted hover:underline"
                  >
                    내역 보기
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
