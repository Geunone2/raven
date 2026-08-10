# 통장 (`/bank`, `/bank/all`, `/bank/income`, `/bank/expense`)

로그인 필수(4개 페이지 모두 `redirect("/login")`).

## 핵심 개념 — 두 개의 서로 다른 원장

이 기능을 이해하려면 두 테이블이 완전히 분리되어 있다는 걸 먼저 알아야 합니다.

- **`guild_treasury_transactions`** ("길드 공용 통장"): 혈비/총무비 적립분, 초기 보유금, 분배 후 잔여금, 운영진이 직접 등록한 지출만 들어갑니다. **개인에게 지급되는 참여/전투력 보상금은 이 테이블을 절대 거치지 않습니다.**
- **`bank_transactions`** ("개인 통장"): 회원 개인의 입출금 내역. 참여/전투력 보상 지급(`loot_distribution`, `content_reward`)도 여기 개인별로 직접 꽂힙니다.

`/bank` "전체" 탭이 보여주는 "총 수입/총 지출/현재 보유금"은 전자(길드 공용 통장) 기준이고, "내 통장" 탭이 보여주는 잔고는 후자(개인 통장) 기준입니다. 이 둘을 섞어서 계산하면 안 됩니다 — 실제로 이 구분이 헷갈려서 여러 차례 재확인/수정된 부분입니다.

## 정산 공식 요약

두 가지 정산 경로가 있고, 계산 방식이 다릅니다.

1. **장비 내판(외판) + 외부수입** — `settleLootSale()` (`lib/actions/treasury.ts`, 관리자 전용, `/admin/bank`에서 실행)
   판매가 × (1 − 세금 9%) = 순수익 → 혈비 30% + 총무비 6%(→ 길드 공용 통장) → 남은 64%를 참여 보상 32% / 전투력 보상 32%로 나눔(= 64% 풀을 50:50) → **일반 2주 기여도**(콘텐츠 종류 무관, 전체 합산, `getMemberContributionPoints()`) 비율 + **전체 길드원** 전투력 비율로 개인 통장에 분배.

2. **고대성채 / 쟁탈전** — `settleContentReward()` (`lib/actions/contentRewards.ts`, 관리자 전용)
   해당 콘텐츠 특정 일정 1건의 총 다이아 → 혈비 30% + 총무비 6% → 남은 64%를 참여도 50% / 전투력 50%로 나눔 → **그 일정에 실제 출석/중간합류한 사람들만** 대상으로, 참여도는 체크인 가중 점수(`getScheduleBasePoints` + `getCheckinPoints`, 중간합류는 절반) 비율로, 전투력은 그 출석자들끼리의 전투력 합 대비 비율로 분배. 참여자가 0명이면 분배 자체가 발생하지 않습니다.

두 정산 액션 모두 관리자 콘솔(`/admin/bank`) 소관이라 이 문서(사용자 페이지)에는 실행 UI가 없지만, 계산 결과(개인 `bank_transactions`)는 `/bank`의 "내 통장" 탭에 그대로 나타나고, 정산 계산기 카드도 동일한 상수/함수를 재사용합니다.

## `/bank` — 메인 페이지 (전체 / 내 통장 토글)

`BankViewToggle`이 두 탭을 전환합니다.

### 전체 탭
- `GuildTreasurySummaryCard`: 현재 보유금 / 총 수입 / 총 지출 요약 카드 3개(각각 `/bank/all`, `/bank/income`, `/bank/expense`로 "전체보기" 링크) + 최근 수입/지출 1건씩(`TrendingUp`/`TrendingDown` 아이콘 표시).
- `GuildTreasuryTable`: 길드 공용 통장 전체 내역 테이블.

### 내 통장 탭
- `MyBankSummaryCard`: 내 누적 입금/출금/잔고 카드.
- `MemberBankOverviewCard`: 전체 길드원 통장 잔고 목록 테이블.
- `SettlementCalculatorCarousel`: "내가 받을 수 있는 정산 몫" 예상 계산기 3장(장비내판 / 고대성채 / 쟁탈전), embla 캐러셀 + ‹›버튼 + 점 인디케이터.
- `BankTransactionTable`: 내 개인 거래 내역 테이블.

## `/bank/all`, `/bank/income`, `/bank/expense` — 전체보기 서브페이지

셋 다 길드 공용 통장(`guild_treasury_transactions`) 기준이며 구조가 거의 동일합니다.

- `/bank/all`: 전체 내역 + `NetTreasuryChart`(막대: 당일 수입/당일 지출, 선: 현재 보유금 누적, 이중 축 — 음수 없이 항상 양수 막대로 표시).
- `/bank/income`: 수입만(`amount > 0`) + `TreasuryTransactionChart`(누적 추이 선, `color="success"`).
- `/bank/expense`: 지출만(`amount < 0`) + `TreasuryTransactionChart`(누적 추이 선, `color="danger"`).

## 파일 구성

```
app/(user)/bank/page.tsx
├── lib/actions/bank.ts                 getBankBalance(), getBankBalancesWithBreakdown(), getBankTransactions()
├── lib/actions/treasury.ts             getGuildTreasuryBalance(), getGuildTreasuryTransactions(), getTotalDistributedRewardPool()
├── lib/actions/members.ts              getMemberPowerShare()
├── lib/actions/scheduleCheckins.ts     getContributionStats(), getContentParticipationStats()
├── lib/auth/session.ts                 getSessionMemberId()
│
└── components/organisms/BankViewToggle.tsx   ("use client", 전체/내 통장 토글)
    ├── components/organisms/GuildTreasurySummaryCard.tsx
    │   ├── components/atoms/RouletteText.tsx
    │   ├── components/atoms/BankIcons.tsx        TotalIcon, IncomeIcon, ExpenseIcon
    │   ├── lucide-react                          TrendingUp, TrendingDown
    │   └── lib/time.ts                           formatMonthDayTimeUtc()
    ├── components/organisms/GuildTreasuryTable.tsx
    │   └── lib/constants/treasury.ts             guildTreasuryTransactionTypeLabels/Tone
    ├── components/organisms/MyBankSummaryCard.tsx
    ├── components/organisms/MemberBankOverviewCard.tsx
    ├── components/organisms/BankTransactionTable.tsx
    │   └── lib/constants/bank.ts                 bankTransactionTypeLabels
    └── components/organisms/SettlementCalculatorCarousel.tsx  ("use client", embla-carousel-react)
        ├── components/organisms/SettlementEstimatorCard.tsx        장비내판 계산기
        │   ├── lib/constants/treasury.ts   PARTICIPATION_SHARE_OF_REWARD_POOL, POWER_SHARE_OF_REWARD_POOL
        │   └── components/atoms/SpinRevealText.tsx
        │       └── components/atoms/RouletteText.tsx  (motion/react)
        └── components/organisms/ContentRewardEstimatorCard.tsx × 2  고대성채/쟁탈전 계산기
            ├── lib/constants/treasury.ts   ADMIN_FEE_RATIO, RESERVE_RATIO
            └── components/atoms/SpinRevealText.tsx (위와 동일)

app/(user)/bank/all/page.tsx
├── lib/actions/treasury.ts             getGuildTreasuryBalance(), getGuildTreasuryTransactions()
├── components/organisms/GuildTreasuryTable.tsx
├── components/organisms/NetTreasuryChart.tsx    (recharts ComposedChart, dual y-axis)
└── components/atoms/BankIcons.tsx      TotalIcon

app/(user)/bank/income/page.tsx
app/(user)/bank/expense/page.tsx
├── lib/actions/treasury.ts             getGuildTreasuryTransactions()
├── components/organisms/GuildTreasuryTable.tsx
├── components/organisms/TreasuryTransactionChart.tsx  (recharts LineChart, 단일 누적선)
└── components/atoms/BankIcons.tsx      IncomeIcon / ExpenseIcon
```

### 관리자 전용(참고용, 이 문서 범위 밖)

정산을 실제로 "실행"하는 액션과 그 결과를 만드는 로직은 `/admin/bank`에 있습니다: `lib/actions/treasury.ts`의 `settleLootSale()`, `recordGuildExpense()`, `lib/actions/contentRewards.ts`의 `settleContentReward()`. `/bank`의 정산 계산기 카드는 이 로직의 **비율 상수만 재사용**할 뿐, 실제 정산을 트리거하지 않는 순수 예측용 UI입니다.

## 참고

- `NetTreasuryChart`는 이번 세션에 여러 차례 시행착오를 거쳐 확정된 버전입니다(막대+선 조합, 분리형 vs 통합형 비교, 음수 제거 등) — 이전에 존재했다가 삭제된 컴포넌트(`BalanceTrendChart`, `TreasuryOverviewChart`, `DailyTreasuryChart`, `DailyFlowChart`, `BalanceLineChart`)는 더 이상 파일로 존재하지 않으니 과거 대화나 커밋 이력에서 이름이 보이더라도 참고하지 마세요.
- `GuildTreasuryTable`의 날짜 컬럼은 `date`(운영진이 지출에만 직접 지정하는 날짜) + `createdAt`의 시각(local time-of-day)을 조합해 항상 `YYYY-MM-DD HH:MM` 한 형식으로 통일해서 보여줍니다.
