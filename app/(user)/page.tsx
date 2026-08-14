import Link from "next/link";
import {getAnnouncements} from "@/lib/actions/announcement/announcements";
import {getSchedulesForCheckin, getSchedulesForMonth} from "@/lib/actions/schedule/schedules";
import {getMyScheduleCheckins} from "@/lib/actions/schedule/scheduleCheckins";
import {getBossTimers} from "@/lib/actions/boss-timer/bossTimers";
import {getOfficialForumNotices} from "@/lib/actions/announcement/officialForum";
import {getMember, getMemberRankings} from "@/lib/actions/member/members";
import {getBankBalance} from "@/lib/actions/treasury/bank";
import {getBidsForLoot, getMyBidAmounts, getOpenAuctionLoots} from "@/lib/actions/loot/loots";
import {bidDeadlineMs, isAuctionEnded} from "@/lib/constants/loot/loots";
import {
    OFFICIAL_FORUM_NOTICE_MENU_SEQ,
    OFFICIAL_FORUM_UPDATE_MENU_SEQ,
    OFFICIAL_FORUM_DEV_NEWS_MENU_SEQ,
} from "@/lib/constants/announcement/officialForum";
import {getSessionMemberId} from "@/lib/auth/session";
import {GuildMember, ScheduleCheckin} from "@/lib/db/schema";
import {formatMonthDay, isWithinLast24Hours, nowKst} from "@/lib/time";
import {ScheduleCalendar} from "@/components/organisms/schedule/ScheduleCalendar";
import {BossTimerCard} from "@/components/organisms/boss-timer/BossTimerCard";
import {RankingCard} from "@/components/organisms/ranking/RankingCard";
import {ForumNoticesCard, LabeledForumNotice} from "@/components/organisms/community/ForumNoticesCard";
import {AuctionCard} from "@/components/organisms/loot/AuctionCard";
import {AttendanceCard} from "@/components/organisms/schedule/AttendanceCard";
import {MyInfoCard} from "@/components/organisms/member/MyInfoCard";
import {CommunityCard} from "@/components/organisms/community/CommunityCard";
import {NewBadge} from "@/components/atoms/NewBadge";

export default async function GuildHomePage() {
    const memberId = await getSessionMemberId();
    // 서버가 UTC로 돌아도(Vercel) "이번 달"은 항상 KST 기준으로 계산한다 —
    // new Date()의 로컬 getter를 그대로 썼으면 자정~오전 9시(KST) 사이엔
    // 서버가 전월로 잘못 계산했다(2026-08-15 수정).
    const now = nowKst();
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
        getSchedulesForMonth(now.year(), now.month() + 1),
        getSchedulesForCheckin(),
        getBossTimers(),
        getOfficialForumNotices(OFFICIAL_FORUM_NOTICE_MENU_SEQ),
        getOfficialForumNotices(OFFICIAL_FORUM_UPDATE_MENU_SEQ),
        getOfficialForumNotices(OFFICIAL_FORUM_DEV_NEWS_MENU_SEQ),
        getMemberRankings(),
        getOpenAuctionLoots(),
    ]);
    let myCheckinScheduleCheckins: Map<number, ScheduleCheckin> = new Map();
    let member: GuildMember | undefined;
    let balance = 0;
    let myBids: Map<number, number> = new Map();

    if (memberId) {
        const [checkinWindowCheckins, memberData, bankBalance, bidAmounts] =
            await Promise.all([
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
            const aTime = a.loot.bidDeadline ? bidDeadlineMs(a.loot.bidDeadline) : Infinity;
            const bTime = b.loot.bidDeadline ? bidDeadlineMs(b.loot.bidDeadline) : Infinity;
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

    // 카드 마크업을 변수로 한 번만 선언해서 모바일 전용 스택과 sm+ 그리드 양쪽에서
    // 재사용한다(아래 "카드 조립" 섹션 참고 — 왜 두 구조로 나눴는지 설명).
    const scheduleCard = (
        <div className="min-h-176 max-h-176 overflow-hidden rounded-xl border border-edge bg-surface p-4 shadow-md">
            <div className="flex items-center justify-between">
                <p className="text-base font-bold text-brand">
                    오늘의 일정
                </p>
                <Link href="/schedule" className="text-xs text-ink-muted hover:underline">
                    전체보기 &gt;
                </Link>
            </div>
            <div className="mt-3">
                <ScheduleCalendar schedules={monthSchedules}/>
            </div>
        </div>
    );

    const leaderAnnouncementsCard = (
        <div className="min-h-70 max-h-70 overflow-hidden rounded-xl border border-edge bg-surface p-4 shadow-md">
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
    );

    const myInfoCard = <MyInfoCard member={member ?? null} balance={balance}/>;
    const bossTimerCard = <BossTimerCard bosses={bosses}/>;
    const communityCard = <CommunityCard/>;
    const totalRankingCard = <RankingCard stat="total" topCount={20} members={rankings.byTotal}/>;
    const attackRankingCard = <RankingCard stat="attack" topCount={10} members={rankings.byAttack}/>;
    const defenseRankingCard = <RankingCard stat="defense" topCount={10} members={rankings.byDefense}/>;
    const accuracyRankingCard = <RankingCard stat="accuracy" topCount={10} members={rankings.byAccuracy}/>;
    const forumNoticesCard = <ForumNoticesCard notices={forumNotices}/>;
    const attendanceCard = (
        <AttendanceCard
            schedules={checkinSchedules}
            myCheckinByScheduleId={myCheckinScheduleCheckins}
            myServer={member?.server ?? null}
        />
    );
    const auctionCard = (
        <AuctionCard rows={displayedAuctions} myBids={myBids} bidsByLootId={bidsByLootId}/>
    );

    // 카드 조립
    //
    // sm 이상(태블릿/PC)은 열마다 카드 높이가 서로 다른 독립된 flex-col 묶음 3개를
    // grid-cols-12로 나란히 배치하는 기존 구조를 그대로 쓴다. CSS Grid는 행(row)
    // 트랙을 모든 열이 공유하기 때문에, 이 카드들을 하나의 flat grid로 합쳐서 순서만
    // 바꾸는 방식으로는 열마다 카드 개수/높이가 다른 지금 레이아웃(예: 좌측 2장 vs
    // 우측 4장)을 재현할 수 없다 — 시도해보니 짧은 열이 옆의 긴 열에 맞춰 강제로
    // 늘어나는 부작용이 생겼다. 그래서 모바일 전용 순서(2026-08-13, 사용자 지정)는
    // 별도의 1단 스택으로 두고 `sm:hidden` / `hidden sm:grid`로 배타적으로
    // 보여준다 — 같은 카드 컴포넌트를 두 곳에서 재사용하지만(위 변수 참고) 화면
    // 폭에 따라 둘 중 하나만 보이므로 실제로 보이는 마크업은 항상 하나뿐이다.
    return (
        <div className="space-y-8">
            {/* 모바일 전용(< sm): 나의 정보 → 일정 → 포럼소식 → 리더공지 → 출석체크 →
                경매 → 보스타이머 → 총랭킹 → 공격력 → 방어력 → 명중 → 커뮤니티 */}
            <div className="grid grid-cols-1 gap-6 sm:hidden">
                {myInfoCard}
                {scheduleCard}
                {forumNoticesCard}
                {leaderAnnouncementsCard}
                {attendanceCard}
                {auctionCard}
                {bossTimerCard}
                {totalRankingCard}
                {attackRankingCard}
                {defenseRankingCard}
                {accuracyRankingCard}
                {communityCard}
            </div>

            {/* 태블릿 전용(sm~lg 미만, 640~1279px): 2컬럼 4그룹.
                각 그룹의 좌/우를 독립된 flex-col로 감싸서, 한쪽이 다른 쪽보다 카드가
                많아도(그룹1: 1장 vs 2장, 그룹4: 2장 vs 3장) 서로 행 높이가 얽히지
                않게 했다 — 카드 12개를 통짜 grid 하나로 평탄화했을 때 짧은 열이 긴
                열 행 높이에 맞춰 늘어나던 문제(2026-08-13, 모바일 작업 때 겪음)와
                같은 원인이라 그룹마다 자체 flex-col로 분리했다. */}
            <div className="hidden grid-cols-2 gap-6 sm:grid lg:hidden">
                {/* 그룹 1 */}
                <div className="flex flex-col gap-6">{scheduleCard}</div>
                <div className="flex flex-col gap-6">
                    {myInfoCard}
                    {bossTimerCard}
                </div>

                {/* 그룹 2 */}
                <div className="flex flex-col gap-6">{forumNoticesCard}</div>
                <div className="flex flex-col gap-6">{leaderAnnouncementsCard}</div>

                {/* 그룹 3 */}
                <div className="flex flex-col gap-6">{attendanceCard}</div>
                <div className="flex flex-col gap-6">{auctionCard}</div>

                {/* 그룹 4 */}
                <div className="flex flex-col gap-6">
                    {totalRankingCard}
                    {attackRankingCard}
                </div>
                <div className="flex flex-col gap-6">
                    {communityCard}
                    {defenseRankingCard}
                    {accuracyRankingCard}
                </div>
            </div>

            {/* PC 전용(lg 이상, 1280px+): 기존 3컬럼 레이아웃 그대로 */}
            <div className="hidden grid-cols-12 gap-6 lg:grid">
                <div className="flex flex-col gap-6 lg:col-span-3">
                    {scheduleCard}
                    {totalRankingCard}
                </div>

                <div className="flex flex-col gap-6 lg:col-span-6">
                    <div className="grid grid-cols-2 gap-6">
                        {forumNoticesCard}
                        {leaderAnnouncementsCard}
                    </div>

                    {attendanceCard}

                    {auctionCard}

                    <div className="grid grid-cols-2 gap-6">
                        {attackRankingCard}
                        {defenseRankingCard}
                    </div>
                </div>

                <div className="flex flex-col gap-6 lg:col-span-3">
                    {myInfoCard}
                    {bossTimerCard}
                    {communityCard}
                    {accuracyRankingCard}
                </div>
            </div>
        </div>
    );
}
