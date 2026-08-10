# 랭킹 (`/ranking`, `/ranking/[memberId]`)

## 목적/기능

### `/ranking` — 랭킹 조회 + 내 전투력 입력
- 상단: 로그인한 회원이 자신의 공격력/방어력/명중/직업/레벨/길드명/캐릭터 타입을 직접 입력하는 폼(`SelfProfileForm`). 비로그인 시 로그인 유도 문구만 표시.
- 하단: 전체 길드원 랭킹 조회 패널(`RankingPanel`) — 닉네임 검색, 길드/직업 필터 칩, 무한스크롤(`IntersectionObserver`, 20개씩).
- **정렬 기준**: 공격력+방어력+명중 총합 내림차순.
- **순위 표시(버그 수정됨)**: 검색/필터로 화면에 보이는 목록이 줄어들어도, 순위 배지는 항상 "전체 길드원 기준" 순위를 보여줍니다. `RankingPanel`이 필터링 전 전체 목록을 총합 기준으로 정렬해 `member.id → 순위` 맵(`rankById`)을 미리 만들고, `RankingTable`은 그 맵에서 순위를 조회합니다 — 예전에는 화면에 보이는 배열의 index+1을 순위로 써서, 검색 결과가 1명뿐이면 무조건 1등으로 잘못 표시되는 버그가 있었습니다(2026-08-11 수정).

### `/ranking/[memberId]` — 개인 상세
- 총합/공격력/방어력/명중 4개 항목의 현재 순위 카드(`MemberRankCards`).
- 4개의 스탯 추이 라인 차트(`MemberStatTrendChart`, recharts 기반) — `member_stat_history` 테이블에 저장된 이력을 사용.

## 파일 구성

### `/ranking`
```
app/(user)/ranking/page.tsx
├── lib/actions/members.ts          getMembersRanked(), getMember(), updateOwnStats()
├── lib/time.ts                     formatMonthDayTimeUtc()
├── components/organisms/SelfProfileForm.tsx
│   ├── lib/db/schema.ts            characterTypes enum
│   ├── components/molecules/FormField.tsx
│   ├── components/atoms/CustomSelect.tsx
│   └── components/atoms/ToastProvider.tsx
└── components/organisms/RankingPanel.tsx  ("use client")
    ├── lib/constants/members.ts    GUILD_NAMES, CLASS_NAMES
    ├── lib/constants/classes.ts    getClassTone()
    ├── lib/colorHash.ts            hashTone() — 길드명 배지 색상
    ├── components/atoms/Badge.tsx, Button.tsx, Input.tsx
    └── components/organisms/RankingTable.tsx
        └── components/atoms/RankBadge.tsx
```

### `/ranking/[memberId]`
```
app/(user)/ranking/[memberId]/page.tsx
├── lib/actions/members.ts          getMember(), getMemberRankPositions(), getMemberStatHistory()
├── components/atoms/ClassBadge.tsx
├── components/organisms/MemberRankCards.tsx
└── components/organisms/MemberStatTrendChart.tsx  (recharts LineChart)
    └── lib/time.ts                formatMonthDayTimeUtc()
```

## 참고

- `RankingPanel`의 `rankById` 맵은 `useMemo`로 `members` prop이 바뀔 때만 재계산됩니다(필터/검색 상태 변경으로는 재계산되지 않음).
