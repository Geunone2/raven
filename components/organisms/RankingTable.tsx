import Link from "next/link";
import { GuildMember } from "@/lib/db/schema";
import { RankBadge } from "@/components/atoms/RankBadge";

export function RankingTable({
  members,
  rankById,
}: {
  members: GuildMember[];
  rankById: Map<number, number>;
}) {
  if (members.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        조건에 맞는 길드원이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      {/* 서버/클래스는 태블릿부터, 길드명/레벨/스탯 3종은 PC부터만 보여준다
          (2026-08-14) — 순위/닉네임/총합은 항상 보여서 랭킹의 핵심은 유지한다. */}
      <table className="w-full min-w-[420px] text-left text-sm md:min-w-[600px] xl:min-w-[760px]">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">순위</th>
            <th className="px-4 py-3 font-medium">닉네임</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">서버</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">길드명</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">클래스</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">레벨</th>
            <th className="px-4 py-3 font-medium">총합</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">공격력</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">방어력</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">명중</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-4 py-3">
                <RankBadge rank={rankById.get(member.id) ?? 0} />
              </td>
              <td className="px-4 py-3 font-medium text-ink">
                <Link href={`/ranking/${member.id}`} className="hover:underline">
                  {member.nickname}
                </Link>
                <p className="text-xs font-normal text-ink-faint md:hidden">
                  {member.server ?? "-"} · {member.className}
                </p>
              </td>
              <td className="hidden px-4 py-3 text-ink-faint md:table-cell">{member.server ?? "-"}</td>
              <td className="hidden px-4 py-3 text-ink-faint xl:table-cell">{member.guildName ?? "-"}</td>
              <td className="hidden px-4 py-3 md:table-cell">{member.className}</td>
              <td className="hidden px-4 py-3 xl:table-cell">{member.level}</td>
              <td className="px-4 py-3 font-semibold text-ink">
                {member.attack + member.defense + member.accuracy}
              </td>
              <td className="hidden px-4 py-3 xl:table-cell">{member.attack}</td>
              <td className="hidden px-4 py-3 xl:table-cell">{member.defense}</td>
              <td className="hidden px-4 py-3 xl:table-cell">{member.accuracy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
