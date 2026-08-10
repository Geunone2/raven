import Link from "next/link";
import { GuildMember } from "@/lib/db/schema";
import { roleLabels } from "@/lib/constants/members";
import { Badge } from "@/components/atoms/Badge";
import { deleteMember } from "@/lib/actions/members";

export function MemberTable({ members }: { members: GuildMember[] }) {
  if (members.length === 0) {
    return (
      <p className="py-12 text-center text-sm text-ink-faint">
        조건에 맞는 길드원이 없습니다.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border border-edge">
      <table className="w-full min-w-[900px] text-left text-sm">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">닉네임</th>
            <th className="px-4 py-3 font-medium">길드명</th>
            <th className="px-4 py-3 font-medium">클래스</th>
            <th className="px-4 py-3 font-medium">레벨</th>
            <th className="px-4 py-3 font-medium">공격력</th>
            <th className="px-4 py-3 font-medium">방어력</th>
            <th className="px-4 py-3 font-medium">명중</th>
            <th className="px-4 py-3 font-medium">직책</th>
            <th className="px-4 py-3 font-medium">최근 접속일</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {members.map((member) => (
            <tr key={member.id}>
              <td className="px-4 py-3 font-medium text-ink">
                {member.nickname}
              </td>
              <td className="px-4 py-3 text-ink-faint">{member.guildName ?? "-"}</td>
              <td className="px-4 py-3">{member.className}</td>
              <td className="px-4 py-3">{member.level}</td>
              <td className="px-4 py-3">{member.attack}</td>
              <td className="px-4 py-3">{member.defense}</td>
              <td className="px-4 py-3">{member.accuracy}</td>
              <td className="px-4 py-3">
                <Badge>{roleLabels[member.role]}</Badge>
              </td>
              <td className="px-4 py-3 text-ink-faint">
                {member.lastLoginAt ?? "-"}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-end gap-3">
                  <Link
                    href={`/admin/members/${member.id}`}
                    className="text-sm text-ink-muted hover:underline"
                  >
                    수정
                  </Link>
                  <form action={deleteMember.bind(null, member.id)}>
                    <button
                      type="submit"
                      className="text-sm text-danger hover:underline"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
