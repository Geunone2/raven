import Link from "next/link";
import {notFound} from "next/navigation";
import {
    getMember,
    getMemberRankPositions,
    getMemberStatHistory,
} from "@/lib/actions/member/members";
import {ClassBadge} from "@/components/organisms/member/ClassBadge";
import {MemberRankCards} from "@/components/organisms/member/MemberRankCards";
import {MemberStatTrendChart} from "@/components/organisms/member/MemberStatTrendChart";
import {MemberCombinedStatTrendChart} from "@/components/organisms/member/MemberCombinedStatTrendChart";

export default async function MemberRankingDetailPage({
                                                          params,
                                                      }: {
    params: Promise<{ memberId: string }>;
}) {
    const {memberId} = await params;
    const id = Number(memberId);
    const member = await getMember(id);
    if (!member) {
        notFound();
    }

    const [positions, history] = await Promise.all([
        getMemberRankPositions(id),
        getMemberStatHistory(id),
    ]);
    if (!positions) {
        notFound();
    }

    return (
        <div className="space-y-8">
            <div>
                <Link href="/ranking" className="text-xs text-ink-muted hover:underline">
                    &lt; 랭킹으로 돌아가기
                </Link>
                <div className="mt-2 flex items-center gap-2">
                    <h1 className="text-xl font-semibold text-ink">{member.nickname}</h1>
                    <ClassBadge job={member.className}/>
                    <p className="mt-1 text-sm text-ink-faint">
                        {member.guildName ?? "-"} · Lv.{member.level}
                    </p>
                </div>
            </div>

            <MemberRankCards positions={positions}/>

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

            <MemberCombinedStatTrendChart history={history}/>
        </div>
    );
}
