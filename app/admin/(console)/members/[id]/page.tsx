import { notFound } from "next/navigation";
import { getMember, updateMember } from "@/lib/actions/members";
import { MemberForm } from "@/components/organisms/MemberForm";

export default async function EditMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const member = await getMember(Number(id));

  if (!member) {
    notFound();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-xl font-semibold text-ink">
        길드원 수정
      </h1>
      <MemberForm member={member} action={updateMember.bind(null, member.id)} />
    </div>
  );
}
