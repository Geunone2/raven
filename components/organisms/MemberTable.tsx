import Link from "next/link";
import { GuildMember } from "@/lib/db/schema";
import { deleteMember, type MemberContributionTotal } from "@/lib/actions/members";
import { formatMonthDayTimeUtcWithSeconds } from "@/lib/time";

export function MemberTable({
  members,
  contributionTotals,
}: {
  members: GuildMember[];
  contributionTotals: Map<number, MemberContributionTotal>;
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
      {/* 칼럼이 원래 12개라 태블릿 이하에서 특히 심하게 깨졌다(2026-08-14).
          닉네임/참여도 점수/actions만 항상 보이게 하고, 서버·클래스·보스 참여도는
          md부터, 나머지(길드명/레벨/스탯 3종/전투력 입력일)는 xl부터 보여준다. */}
      <table className="w-full min-w-[480px] text-left text-sm md:min-w-[760px] xl:min-w-[1200px]">
        <thead className="bg-surface-raised text-ink-faint">
          <tr>
            <th className="px-4 py-3 font-medium">닉네임</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">서버</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">길드명</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">클래스</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">레벨</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">공격력</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">방어력</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">명중</th>
            <th className="hidden px-4 py-3 font-medium xl:table-cell">전투력 입력일</th>
            <th className="px-4 py-3 font-medium">참여도 점수</th>
            <th className="hidden px-4 py-3 font-medium md:table-cell">보스 참여도 누적 점수</th>
            <th className="px-4 py-3 font-medium" />
          </tr>
        </thead>
        <tbody className="divide-y divide-edge">
          {members.map((member) => {
            const contribution = contributionTotals.get(member.id) ?? {
              auto: 0,
              adjustment: member.participationPointsAdjustment,
              total: member.participationPointsAdjustment,
              bossScore: 0,
            };
            return (
              <tr key={member.id}>
                <td className="px-4 py-3 font-medium text-ink">
                  <p>{member.nickname}</p>
                  {/* md 미만에서만 서버/클래스를 닉네임 아래에 같이 보여준다. */}
                  <p className="text-xs font-normal text-ink-faint md:hidden">
                    {member.server ?? "-"} · {member.className}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-ink-faint md:table-cell">{member.server ?? "-"}</td>
                <td className="hidden px-4 py-3 text-ink-faint xl:table-cell">{member.guildName ?? "-"}</td>
                <td className="hidden px-4 py-3 md:table-cell">{member.className}</td>
                <td className="hidden px-4 py-3 xl:table-cell">{member.level}</td>
                <td className="hidden px-4 py-3 xl:table-cell">{member.attack}</td>
                <td className="hidden px-4 py-3 xl:table-cell">{member.defense}</td>
                <td className="hidden px-4 py-3 xl:table-cell">{member.accuracy}</td>
                <td className="hidden px-4 py-3 text-ink-faint xl:table-cell">
                  {member.statsUpdatedAt ? formatMonthDayTimeUtcWithSeconds(member.statsUpdatedAt) : "-"}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-brand">{contribution.total}점</p>
                  <p className="text-xs text-ink-faint">
                    자동 {contribution.auto}
                    {contribution.adjustment !== 0 &&
                      ` · 보정 ${contribution.adjustment > 0 ? "+" : ""}${contribution.adjustment}`}
                  </p>
                </td>
                <td className="hidden px-4 py-3 text-ink-faint md:table-cell">{contribution.bossScore}점</td>
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
