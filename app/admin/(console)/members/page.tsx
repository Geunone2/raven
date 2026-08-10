import { getMembers } from "@/lib/actions/members";
import { MemberFilterBar } from "@/components/organisms/MemberFilterBar";
import { MemberTable } from "@/components/organisms/MemberTable";

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; role?: string }>;
}) {
  const { q, role } = await searchParams;
  const members = await getMembers({ q, role });

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        길드원 관리
      </h1>
      <MemberFilterBar defaultQuery={q} defaultRole={role} />
      <MemberTable members={members} />
    </div>
  );
}
