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
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">순위</th>
            <th className="px-4 py-3 font-medium">닉네임</th>
            <th className="px-4 py-3 font-medium">길드명</th>
            <th className="px-4 py-3 font-medium">클래스</th>
            <th className="px-4 py-3 font-medium">레벨</th>
            <th className="px-4 py-3 font-medium">총합</th>
            <th className="px-4 py-3 font-medium">공격력</th>
            <th className="px-4 py-3 font-medium">방어력</th>
            <th className="px-4 py-3 font-medium">명중</th>
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
              </td>
              <td className="px-4 py-3 text-ink-faint">{member.guildName ?? "-"}</td>
              <td className="px-4 py-3">{member.className}</td>
              <td className="px-4 py-3">{member.level}</td>
              <td className="px-4 py-3 font-semibold text-ink">
                {member.attack + member.defense + member.accuracy}
              </td>
              <td className="px-4 py-3">{member.attack}</td>
              <td className="px-4 py-3">{member.defense}</td>
              <td className="px-4 py-3">{member.accuracy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
