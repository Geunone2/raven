import { getMemberParticipationContributions, getMembers } from "@/lib/actions/member/members";
import { MemberPanel } from "@/components/organisms/member/MemberPanel";

export default async function MembersPage() {
  const [members, contributions] = await Promise.all([
    getMembers(),
    getMemberParticipationContributions(),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        길드원 관리
      </h1>
      <MemberPanel members={members} contributions={contributions} />
    </div>
  );
}
