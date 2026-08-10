# 통장 관리 (`/admin/bank`)

정산을 실제로 "실행"하는 화면입니다. 회원용 `/bank`([`docs/pages/08-bank.md`](../pages/08-bank.md))는 결과 조회 + 예측 계산기만 제공하고, 실제 정산 트리거는 전부 여기 있습니다. 두 문서를 같이 보세요 — 특히 두 원장(`guild_treasury_transactions` vs `bank_transactions`)의 구분은 `docs/pages/08-bank.md`의 "핵심 개념"에 정리되어 있고 여기서도 동일하게 적용됩니다.

## 목적/기능

### `/admin/bank` (개요)
한 페이지에 여러 섹션이 나열되어 있습니다.

- **길드 공용 통장 잔고**: `getGuildTreasuryBalance()`.
- **정산 대기 중인 내판**(`UnsettledAuctionsPanel`): `loots.settledAt`이 비어있는 경매 완료 건 목록 + 정산 실행 버튼 → `settleLootSale(lootId)`. 판매가 → 세금 9% 제외 → 혈비 30%/총무비 6%(→ 길드 공용 통장) → 남은 64%를 일반 2주 기여도 비율 32% + 전체 길드원 전투력 비율 32%로 개인 통장에 분배.
- **정산 대기 중인 고대성채/쟁탈전**(`ContentRewardSettlementPanel`): `getUnsettledContentRewardSchedules()` — 완료된 고대성채/쟁탈전 일정 중 `content_schedules.rewardSettledAt`이 비어있는 것. 관리자가 총 다이아를 직접 입력하면 `settleContentReward(scheduleId, formData)` 실행 → 혈비 30%/총무비 6% 제외 → 남은 64%를 그 일정 실제 참여자 기준 참여도 50%/전투력 50%로 분배.
- **지출 기록**(`GuildExpenseForm`): `recordGuildExpense()` — 길드 공용 통장에서 직접 차감(사유/날짜/비고 입력).
- **길드 공용 통장 거래 내역**(`GuildTreasuryTable`): `guild_treasury_transactions` 전체 목록.
- **길드원 개인 통장 목록**(`BankOverviewTable`): 전체 회원 잔고 요약, 각 행에서 `/admin/bank/[memberId]`로 이동.

### `/admin/bank/[memberId]` (개인 통장 상세)
특정 회원의 개인 통장(`bank_transactions`) 조회 + 수동 조정. `BankAdjustForm` → `createBankTransaction(memberId, formData)`로 입금/출금/조정 등을 직접 기록할 수 있습니다(정산 자동 지급과는 별도의, 운영진이 임의로 넣는 수동 거래).

## 파일 구성

```
app/admin/(console)/bank/page.tsx
├── lib/actions/bank.ts                 getBankBalances()
├── lib/actions/treasury.ts             getGuildTreasuryBalance(), getGuildTreasuryTransactions(), getUnsettledAuctionLoots()
├── lib/actions/contentRewards.ts       getUnsettledContentRewardSchedules()
├── components/organisms/BankOverviewTable.tsx
├── components/organisms/GuildTreasuryTable.tsx
│   └── lib/constants/treasury.ts       guildTreasuryTransactionTypeLabels/Tone
├── components/organisms/GuildExpenseForm.tsx
│   └── lib/actions/treasury.ts         recordGuildExpense()
├── components/organisms/UnsettledAuctionsPanel.tsx
│   └── lib/actions/treasury.ts         settleLootSale()
└── components/organisms/ContentRewardSettlementPanel.tsx
    ├── lib/constants/schedules.ts      contentTypeLabels
    └── lib/actions/contentRewards.ts   settleContentReward()

app/admin/(console)/bank/[memberId]/page.tsx
├── lib/actions/bank.ts                 getBankBalance(), getBankTransactions(), createBankTransaction()
├── lib/actions/members.ts              getMember()
├── components/organisms/BankAdjustForm.tsx
│   └── lib/constants/bank.ts           bankTransactionTypeLabels, manualBankTransactionTypes
└── components/organisms/BankTransactionTable.tsx
    └── lib/constants/bank.ts           bankTransactionTypeLabels
```

## 참고

- 정산 비율 상수(`SALE_TAX_RATE`, `RESERVE_RATIO`, `ADMIN_FEE_RATIO`, `PARTICIPATION_SHARE_OF_REWARD_POOL`, `POWER_SHARE_OF_REWARD_POOL` 등)는 전부 `lib/constants/treasury.ts`에 있고, 회원용 정산 예측 계산기(`SettlementEstimatorCard`, `ContentRewardEstimatorCard`)도 이 상수를 그대로 재사용합니다 — 비율을 바꾸면 실제 정산과 예측 계산기가 함께 바뀝니다.
- `settleLootSale`/`settleContentReward` 모두 `db.transaction()`을 동기 콜백으로 씁니다(better-sqlite3 제약 — 콜백 내부에 `async`/`await`을 쓰면 런타임 에러가 나거나 부분 실행된 채로 죽을 수 있음, `docs/handoff.md` 참고).
- 고대성채/쟁탈전 참여자가 0명이면 `settleContentReward`는 분배 자체를 발생시키지 않습니다(0으로 나누기 방지 + 애초에 분배 대상이 없다는 의미).
