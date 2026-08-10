# 보상 분배 (`/admin/loots`)

## 목적/기능

`loots` 테이블(전리품/분배 대상 아이템) CRUD + 경매 낙찰 처리.

- **목록/필터**(`/admin/loots`): 분배 상태(`lootDistributionStatuses`)로 필터, 대시보드의 "분배 대기 전리품" 카운트(`countPendingLoots()`)와 같은 데이터 소스.
- **등록**(`new`): 등급/종류/보관 길드/분배 방식 등 기본 정보 + 관련 일정(`getSchedules()`로 드롭다운) 연결.
- **수정**(`[id]`): 동일 폼 + **경매(`distributionMethod === "auction"`)인 경우** 입찰 목록(`AuctionBidList`)이 추가로 표시되고, `awardAuction()`으로 낙찰자를 수동 지정할 수 있습니다.

## 파일 구성

```
app/admin/(console)/loots/page.tsx
├── lib/actions/loots.ts                getLoots({ status })
├── components/organisms/LootFilterBar.tsx
│   ├── lib/db/schema.ts                lootDistributionStatuses enum
│   └── lib/constants/dungeonRuns.ts    distributionStatusLabels
└── components/organisms/LootTable.tsx
    ├── lib/constants/loots.ts
    ├── lib/constants/dungeonRuns.ts    distributionStatusLabels
    ├── components/atoms/Badge.tsx
    └── lib/actions/loots.ts            deleteLoot()

app/admin/(console)/loots/new/page.tsx
├── lib/actions/loots.ts                createLoot()
├── lib/actions/schedules.ts            getSchedules()
└── components/organisms/LootForm.tsx
    ├── lib/constants/loots.ts
    └── lib/constants/dungeonRuns.ts    distributionStatusLabels

app/admin/(console)/loots/[id]/page.tsx
├── lib/actions/loots.ts                getLoot(), updateLoot(), getBidsForLoot()
├── lib/actions/schedules.ts            getSchedules()
├── components/organisms/LootForm.tsx   (위와 동일)
└── components/organisms/AuctionBidList.tsx   (distributionMethod === "auction"일 때만)
    └── lib/actions/loots.ts            awardAuction()
```

## 참고

- 경매 낙찰 로직은 자동(마감 시 최고 전투력 기준)과 수동(이 화면의 `awardAuction()`) 두 경로가 있습니다 — 자동 낙찰 세부 로직은 `lib/actions/loots.ts`의 마감 처리 부분, 회원용 UI는 `docs/pages/06-auctions.md` 참고(단, 그 페이지는 스펙이 명시적으로 보류 중).
- 정산(`settleLootSale`)은 이 화면이 아니라 `/admin/bank`에서 실행합니다 — `loots.settledAt`이 채워진 건만 정산 완료로 취급됩니다([06-bank.md](./06-bank.md) 참고).
