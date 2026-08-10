import Link from "next/link";
import {getAnnouncements} from "@/lib/actions/announcements";
import {getSchedulesForCheckin, getSchedulesForMonth} from "@/lib/actions/schedules";
import {getMyScheduleCheckins} from "@/lib/actions/scheduleCheckins";
import {getBossTimers} from "@/lib/actions/bossTimers";
import {getOfficialForumNotices} from "@/lib/actions/officialForum";
import {getMember, getMemberRankings} from "@/lib/actions/members";
import {getBankBalance} from "@/lib/actions/bank";
import {getBidsForLoot, getMyBidAmounts, getOpenAuctionLoots} from "@/lib/actions/loots";
import {isAuctionEnded} from "@/lib/constants/loots";
import {
    OFFICIAL_FORUM_NOTICE_MENU_SEQ,
    OFFICIAL_FORUM_UPDATE_MENU_SEQ,
    OFFICIAL_FORUM_DEV_NEWS_MENU_SEQ,
} from "@/lib/constants/officialForum";
import {getSessionMemberId} from "@/lib/auth/session";
import {GuildMember, ScheduleCheckin} from "@/lib/db/schema";
import {formatMonthDay, isWithinLast24Hours} from "@/lib/time";
import {ScheduleCalendar} from "@/components/organisms/ScheduleCalendar";
import {BossTimerCard} from "@/components/organisms/BossTimerCard";
import {RankingCard} from "@/components/organisms/RankingCard";
import {ForumNoticesCard, LabeledForumNotice} from "@/components/organisms/ForumNoticesCard";
import {AuctionCard} from "@/components/organisms/AuctionCard";
import {AttendanceCard} from "@/components/organisms/AttendanceCard";
import {MyInfoCard} from "@/components/organisms/MyInfoCard";
import {CommunityCard} from "@/components/organisms/CommunityCard";
import {NewBadge} from "@/components/atoms/NewBadge";

export default async function GuildHomePage() {
    const memberId = await getSessionMemberId();
    const now = new Date();
    const [
        announcements,
        monthSchedules,
        checkinSchedules,
        bosses,
        officialNotices,
        officialUpdates,
        devNews,
        rankings,
        openAuctions,
    ] = await Promise.all([
        getAnnouncements(),
        getSchedulesForMonth(now.getFullYear(), now.getMonth() + 1),
        getSchedulesForCheckin(),
        getBossTimers(),
        getOfficialForumNotices(OFFICIAL_FORUM_NOTICE_MENU_SEQ),
        getOfficialForumNotices(OFFICIAL_FORUM_UPDATE_MENU_SEQ),
        getOfficialForumNotices(OFFICIAL_FORUM_DEV_NEWS_MENU_SEQ),
        getMemberRankings(),
        getOpenAuctionLoots(),
    ]);
    let myMonthCheckins: Map<number, ScheduleCheckin> = new Map();
    let myCheckinScheduleCheckins: Map<number, ScheduleCheckin> = new Map();
    let member: GuildMember | undefined;
    let balance = 0;
    let myBids: Map<number, number> = new Map();

    if (memberId) {
        const [monthCheckins, checkinWindowCheckins, memberData, bankBalance, bidAmounts] =
            await Promise.all([
                getMyScheduleCheckins(
                    memberId,
                    monthSchedules.map((schedule) => schedule.id)
                ),
                getMyScheduleCheckins(
                    memberId,
                    checkinSchedules.map((schedule) => schedule.id)
                ),
                getMember(memberId),
                getBankBalance(memberId),
                getMyBidAmounts(
                    memberId,
                    openAuctions.map((row) => row.loot.id)
                ),
            ]);
        myMonthCheckins = monthCheckins;
        myCheckinScheduleCheckins = checkinWindowCheckins;
        member = memberData;
        balance = bankBalance;
        myBids = bidAmounts;
    }
    const recentAnnouncements = announcements.slice(0, 5);
    // 대시보드에는 마감된 경매를 아예 노출하지 않는다 — 마감 여부는 /auctions에서만 확인.
    // 남은 진행중 경매는 마감이 가장 임박한(=카운트다운이 가장 빠른) 순으로 정렬한다.
    // 마감일이 없는 경매는 맨 뒤로 보낸다.
    const auctionsByDeadline = openAuctions
        .filter((row) => !isAuctionEnded(row.loot))
        .sort((a, b) => {
            const aTime = a.loot.bidDeadline ? new Date(a.loot.bidDeadline).getTime() : Infinity;
            const bTime = b.loot.bidDeadline ? new Date(b.loot.bidDeadline).getTime() : Infinity;
            return aTime - bTime;
        });
    const displayedAuctions = auctionsByDeadline.slice(0, 5);
    const bidsForDisplayedAuctions = await Promise.all(
        displayedAuctions.map((row) => getBidsForLoot(row.loot.id))
    );
    const bidsByLootId = new Map(
        displayedAuctions.map((row, index) => [row.loot.id, bidsForDisplayedAuctions[index]])
    );
    const forumNotices: LabeledForumNotice[] = [
        ...officialNotices.map((notice) => ({...notice, source: "notice" as const})),
        ...officialUpdates.map((notice) => ({...notice, source: "update" as const})),
        ...devNews.map((notice) => ({...notice, source: "devnote" as const})),
    ]
        .sort((a, b) => b.regDate - a.regDate)
        .slice(0, 6);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-12 gap-6">
                <div
                    className="col-span-12 order-none flex flex-col gap-6 sm:col-span-6 md:order-1 md:col-span-6 xl:col-span-3 xl:order-none">
                    <div className="min-h-176 rounded-xl border border-edge bg-surface p-4 shadow-md">
                        <div className="flex items-center justify-between">
                            <p className="text-base font-bold text-brand">
                                오늘의 일정
                            </p>
                            <Link href="/schedule" className="text-xs text-ink-muted hover:underline">
                                전체보기 &gt;
                            </Link>
                        </div>
                        <div className="mt-3">
                            <ScheduleCalendar
                                schedules={monthSchedules}
                                myCheckinByScheduleId={myMonthCheckins}
                                memberId={memberId}
                            />
                        </div>
                    </div>

                    <RankingCard stat="total" topCount={20} members={rankings.byTotal}/>
                </div>

                <div
                    className="col-span-12 order-none flex flex-col gap-6 sm:col-span-6 md:order-3 md:col-span-12 xl:col-span-6 xl:order-none">
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <ForumNoticesCard notices={forumNotices}/>

                        <div className="min-h-70 rounded-xl border border-edge bg-surface p-4 shadow-md">
                            <div className="flex items-center justify-between">
                                <p className="text-base font-bold text-brand">
                                    리더 공지사항
                                </p>
                                <Link href="/notices" className="text-xs text-ink-muted hover:underline">
                                    전체보기 &gt;
                                </Link>
                            </div>
                            {recentAnnouncements.length === 0 ? (
                                <p className="mt-4 text-sm text-ink-faint">등록된 공지가 없습니다.</p>
                            ) : (
                                <ul className="mt-4 space-y-3 text-sm">
                                    {recentAnnouncements.map((announcement) => (
                                        <li key={announcement.id} className="flex items-center justify-between gap-2">
                                            <Link
                                                href={`/notices/leader-${announcement.id}`}
                                                className="min-w-0 truncate hover:underline"
                                            >
                                                {announcement.isPinned && (
                                                    <span className="text-brand">[고정] </span>
                                                )}
                                                {announcement.title}
                                                {isWithinLast24Hours(announcement.createdAt) && <NewBadge/>}
                                            </Link>
                                            <span className="shrink-0 text-xs text-ink-faint">
                        {formatMonthDay(announcement.createdAt)}
                      </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    <AttendanceCard
                        schedules={checkinSchedules}
                        myCheckinByScheduleId={myCheckinScheduleCheckins}
                        myGuildName={member?.guildName ?? null}
                    />

                    <AuctionCard
                        rows={displayedAuctions}
                        myBids={myBids}
                        bidsByLootId={bidsByLootId}
                    />

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <RankingCard stat="attack" topCount={10} members={rankings.byAttack}/>
                        <RankingCard stat="defense" topCount={10} members={rankings.byDefense}/>
                    </div>
                </div>

                <div
                    className="col-span-12 order-none flex flex-col gap-6 sm:col-span-6 md:order-2 md:col-span-6 xl:col-span-3 xl:order-none">
                    {member && <MyInfoCard member={member} balance={balance}/>}
                    <BossTimerCard bosses={bosses}/>
                    <CommunityCard/>
                    <RankingCard stat="accuracy" topCount={10} members={rankings.byAccuracy}/>
                </div>
            </div>
        </div>
    );
}
