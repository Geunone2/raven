# 보스 타이머 (`/admin/boss-timers`)

## 목적/기능

`boss_timers` 테이블 CRUD. 고정 시간형(`fixed`)/리젠형(`respawn`)/어비스 수·일형(`weekly_wed_sun`, `weekly_sunday`) 4종류.

- **목록**(`/admin/boss-timers`): 다음 출현 시각을 매 렌더마다 계산(`getNextSpawnAt()`)해서 보여줌 — DB에 저장된 값이 아닙니다.
- **등록**(`new`): 이름/타입/타입별 필요 필드(고정 시간 or 요일).
- **수정**(`[id]`): 동일 폼 + **리젠형(`type === "respawn"`)인 경우** 처치 시각 기록 폼이 추가로 표시됩니다(`recordBossKill()`, 비우면 현재 시각으로 기록) — 이 마지막 처치 시각이 다음 출현 시각 계산의 기준이 됩니다.

## 파일 구성

```
app/admin/(console)/boss-timers/page.tsx
├── lib/actions/bossTimers.ts           getBossTimers()
└── components/organisms/BossTimerTable.tsx
    ├── lib/constants/bossTimers.ts     bossTimerTypeLabels, getNextSpawnAt()
    ├── components/atoms/Badge.tsx
    └── lib/actions/bossTimers.ts       deleteBossTimer()

app/admin/(console)/boss-timers/new/page.tsx
├── lib/actions/bossTimers.ts           createBossTimer()
└── components/organisms/BossTimerForm.tsx
    ├── lib/db/schema.ts                bossTimerTypes enum
    └── lib/constants/bossTimers.ts     bossTimerTypeLabels

app/admin/(console)/boss-timers/[id]/page.tsx
├── lib/actions/bossTimers.ts           getBossTimer(), updateBossTimer(), recordBossKill()
├── components/organisms/BossTimerForm.tsx  (위와 동일)
├── components/molecules/FormField.tsx  (처치 시각 기록용 인라인 폼, 별도 컴포넌트 없이 페이지에 직접 작성됨)
├── components/atoms/Input.tsx          type="datetime-local"
└── components/atoms/Button.tsx
```

## 참고

- 처치 시각(`lastKilledAt`)은 `datetime-local` 입력값(로컬 시간)이라 `lib/time.ts`의 UTC 파싱 계열 함수(`toEpochMs` 등)를 쓰면 안 됩니다 — `new Date(str)`로 직접 파싱하는 게 맞습니다(`docs/handoff.md` 6-2번 참고).
- `getNextSpawnAt()`이 렌더마다 재계산하는 순수 함수라, 이 테이블 자체에는 "다음 출현 시각" 컬럼이 없습니다.
