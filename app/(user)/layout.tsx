import { getSessionMemberId } from "@/lib/auth/session";
import { getMember } from "@/lib/actions/members";
import { Header } from "@/components/organisms/Header";
import { Footer } from "@/components/organisms/Footer";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const memberId = await getSessionMemberId();
  const member = memberId ? await getMember(memberId) : null;

  return (
    <div className="flex flex-1 flex-col">
      <Header member={member} />
      <main className="flex flex-1 bg-surface px-6 py-10">
        <div className="mx-auto w-full max-w-7xl">{children}</div>
      </main>
      <Footer />
    </div>
  );
}
