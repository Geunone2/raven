import { notFound } from "next/navigation";
import {
  getMember,
  getMemberParticipationHistory,
  getMemberStatHistory,
  updateMember,
} from "@/lib/actions/member/members";
import { MemberForm } from "@/components/organisms/member/MemberForm";
import { MemberStatTrendChart } from "@/components/organisms/member/MemberStatTrendChart";
import { MemberCombinedStatTrendChart } from "@/components/organisms/member/MemberCombinedStatTrendChart";
import { MemberParticipationHistoryTable } from "@/components/organisms/member/MemberParticipationHistoryTable";
import { Button } from "@/components/atoms/Button";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const memberId = Number(id);
  const [member, history, participationHistory] = await Promise.all([
    getMember(memberId),
    getMemberStatHistory(memberId),
    getMemberParticipationHistory(memberId),
  ]);

  if (!member) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        길드원 수정
      </h1>
      <MemberForm member={member} action={updateMember.bind(null, member.id)} />

      <div>
        <h2 className="mb-3 text-base font-bold text-brand">전투력 추이</h2>
        <div className="space-y-4">
          <MemberCombinedStatTrendChart history={history} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <MemberStatTrendChart
              title="공격력 추이"
              history={history}
              dataKey="attack"
              color="var(--color-rank-attack)"
            />
            <MemberStatTrendChart
              title="방어력 추이"
              history={history}
              dataKey="defense"
              color="var(--color-rank-defense)"
            />
            <MemberStatTrendChart
              title="명중 추이"
              history={history}
              dataKey="accuracy"
              color="var(--color-rank-accuracy)"
            />
          </div>
        </div>
        {/* MemberForm 자체엔 저장 버튼이 없고, form="member-edit-form"으로
            그 폼에 연결만 해서 여기(전투력 추이 아래)에 배치한다. */}
        <div className="mt-4 flex justify-end">
          <Button type="submit" form="member-edit-form">
            저장
          </Button>
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-base font-bold text-brand">참여 이력</h2>
        <MemberParticipationHistoryTable history={participationHistory} />
      </div>
    </div>
  );
}
