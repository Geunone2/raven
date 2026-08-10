import Link from "next/link";
import { getMember, getMembersRanked, updateOwnStats } from "@/lib/actions/members";
import { getSessionMemberId } from "@/lib/auth/session";
import { formatMonthDayTimeUtc } from "@/lib/time";
import { RankingPanel } from "@/components/organisms/RankingPanel";
import { SelfProfileForm } from "@/components/organisms/SelfProfileForm";

export default async function RankingPage() {
  const memberId = await getSessionMemberId();
  const [members, self] = await Promise.all([
    getMembersRanked(),
    memberId ? getMember(memberId) : Promise.resolve(null),
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-xl font-semibold text-ink">
        전투력 랭킹
      </h1>

      <div className="rounded-xl border border-edge bg-surface p-4 shadow-md">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-bold text-brand">
            내 전투력 입력
          </h2>
          {self?.statsUpdatedAt && (
            <span className="text-xs text-ink-faint">
              전투력 저장 시각: {formatMonthDayTimeUtc(self.statsUpdatedAt)}
            </span>
          )}
        </div>
        {self ? (
          <SelfProfileForm member={self} action={updateOwnStats} />
        ) : (
          <p className="text-sm text-ink-muted">
            <Link href="/login" className="underline">
              로그인
            </Link>
            하면 여기서 본인 전투력을 입력할 수 있어요.
          </p>
        )}
      </div>

      <div className="rounded-xl border border-edge bg-surface p-4 shadow-md">
        <h2 className="mb-3 text-base font-bold text-brand">
          랭킹 조회
        </h2>
        <RankingPanel members={members} />
      </div>
    </div>
  );
}
