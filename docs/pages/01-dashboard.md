# 홈 대시보드 (`/`)

`app/(user)/page.tsx` — `GuildHomePage`

## 목적/기능

로그인 여부와 무관하게 접근 가능하지만(비로그인 시 개인화된 카드들은 빈 상태), 로그인한 회원에게는 일정/공지/출석/랭킹/경매/내 정보/보스 타이머를 한 화면에 모아 보여주는 진입 페이지입니다. 가장 복잡한 페이지이며, `grid-cols-12` 2행 레이아웃으로 구성됩니다(`xl` 기준 3/6/3 분할, `sm`/`md`에서는 `order-*` 유틸리티로 순서를 재배치).

**1행**
- 좌(3): 오늘의 일정 미리보기(`ScheduleCalendar`) + 총합 랭킹 카드
- 중(6): 공식 포럼 소식 카드 + 리더 공지사항 카드(나란히) → 출석체크 카드 → 경매 카드 → [공격력 | 방어력] 랭킹 카드
- 우(3): 내 정보 카드 → 보스 타이머 카드 → 커뮤니티 카드 → 명중 랭킹 카드

**비로그인 시**: `memberId`가 없으면 개인화 데이터(내 체크인, 내 정보, 잔고, 내 입찰액)는 전부 기본값(빈 Map/0)으로 렌더링됩니다. `MyInfoCard`는 `member`가 있을 때만 렌더링.

**경매 카드 노출 규칙**: 마감된 경매는 대시보드에서 아예 제외하고, 마감 임박순으로 정렬해 상위 5개만 노출합니다(마감일 없는 경매는 맨 뒤).

**공식 포럼 소식**: 공지/업데이트/개발자노트 3개 게시판을 합쳐 최신순 6개만 노출.

## 파일 구성

```
app/(user)/page.tsx
├── lib/actions/announcements.ts        getAnnouncements()
├── lib/actions/schedules.ts            getSchedulesForCheckin(), getSchedulesForMonth()
├── lib/actions/scheduleCheckins.ts     getMyScheduleCheckins()
├── lib/actions/bossTimers.ts           getBossTimers()
├── lib/actions/officialForum.ts        getOfficialForumNotices()
├── lib/actions/members.ts              getMember(), getMemberRankings()
├── lib/actions/bank.ts                 getBankBalance()
├── lib/actions/loots.ts                getOpenAuctionLoots(), getBidsForLoot(), getMyBidAmounts()
├── lib/constants/loots.ts              isAuctionEnded()
├── lib/constants/officialForum.ts      OFFICIAL_FORUM_*_MENU_SEQ 상수
├── lib/auth/session.ts                 getSessionMemberId()
├── lib/time.ts                         formatMonthDay(), isWithinLast24Hours()
│
├── components/organisms/ScheduleCalendar.tsx   오늘의 일정 미니 캘린더
│   └── lib/constants/attendance.ts     attendanceStatusLabels
├── components/organisms/RankingCard.tsx        랭킹 카드(총합/공격력/방어력/명중 공용)
│   ├── components/atoms/RankBadge.tsx
│   └── components/atoms/ClassBadge.tsx
│       └── lib/constants/classes.ts    getClassShortName(), getClassIcon()
├── components/organisms/ForumNoticesCard.tsx   공식 포럼 소식 카드
│   ├── components/atoms/NewBadge.tsx
│   └── components/atoms/SourceLabel.tsx
├── components/organisms/AuctionCard.tsx        경매 캐러셀 카드 ("use client" 전체)
│   ├── embla-carousel-react, embla-carousel-autoplay (5초 자동 슬라이드)
│   ├── components/atoms/TimerIcon.tsx
│   ├── components/atoms/LootBidCountdown.tsx
│   └── components/atoms/AuctionBidButtons.tsx
│       ├── lib/actions/loots.ts        placeBid(), cancelBid()
│       ├── lib/hooks/useClickDebounce.ts
│       └── components/atoms/ToastProvider.tsx
├── components/organisms/AttendanceCard.tsx     출석체크 미리보기(상위 2건)
│   ├── lib/constants/members.ts        getGuildServer()
│   └── components/atoms/ScheduleCheckinButtons.tsx
│       └── lib/actions/scheduleCheckins.ts   setMyScheduleCheckin()
├── components/organisms/MyInfoCard.tsx         내 정보 카드
│   └── components/atoms/BankIcons.tsx  TotalIcon
├── components/organisms/BossTimerCard.tsx      보스 타이머 카드
│   ├── lib/constants/bossTimers.ts     getNextSpawnAt()
│   ├── lib/hooks/useLiveNow.ts
│   └── components/atoms/RouletteText.tsx
├── components/organisms/CommunityCard.tsx      디스코드/카카오톡 링크 카드 (실제 링크 연결됨, placeholder 아님)
└── components/atoms/NewBadge.tsx
```

## 참고

- `lib/db/schema.ts`의 `contentTypes` enum(길드던전/어비스/필드보스/균열/고대성채/기타)이 일정표·출석체크에 공용으로 재사용됩니다.
- 반응형은 `sm`/`md`/`xl` 세 단계만 사용(`lg` 미사용 — `docs/handoff.md` 6-5번 참고), 실기기 검증은 `xl`만 이루어진 상태입니다([00-roadmap.md](./00-roadmap.md) 참고).
