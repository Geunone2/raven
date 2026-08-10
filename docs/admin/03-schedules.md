# 콘텐츠 일정표 (`/admin/schedules`)

## 목적/기능

`content_schedules` 테이블 CRUD(목록/등록/수정) + 일정별 부가 기능 2종.

- **목록/필터**(`/admin/schedules`): 콘텐츠 종류(`contentTypes`)로 필터.
- **등록/수정**(`new`, `[id]`): 종류/제목/날짜/집결·시작·종료 시각/대상/서버/장소/필요 아이템/공지문/상태 + (이번 세션에 추가된) 보스 등급(`bossTier`)·전투 여부(`hasCombat`)·전투 시간(`combatHours`) — 출석 체크 기여 점수 계산(`getScheduleBasePoints`, `lib/constants/schedules.ts`)이 이 필드들을 그대로 사용합니다.
- **길드 던전 기록**(`/admin/schedules/[id]/dungeon`, `type === "guild_dungeon"`만 접근 가능): 던전 결과(`guild_dungeon_runs`, 1:1) 입력 폼 + 아래 참여 체크 테이블.
- **참여 체크**(`/admin/schedules/[id]/participation`): 일정별 회원 참여 상태를 관리자가 직접 기록하는 화면. `participations` 테이블 — `plannedStatus`(사전 RSVP, 지금은 셀프서비스 입력 경로가 없어 사실상 관리자가만 채움)와 `actualStatus`(실제 참석 여부, 어비스는 `ticketStatus`도 함께 관리)를 이원화해서 관리. **주의: 이 `participations`/`ParticipationTable`은 회원용 `/attendance` 페이지가 쓰는 `schedule_checkins`와 완전히 별개의 테이블·기능입니다** — 서로 자동 동기화되지 않으므로, 어느 쪽 데이터를 정산/통계에 쓸지 헷갈리지 않도록 주의하세요(현재 통장 정산은 `schedule_checkins` 쪽만 사용, `docs/pages/08-bank.md` 참고).

## 파일 구성

```
app/admin/(console)/schedules/page.tsx
├── lib/actions/schedules.ts            getSchedules({ type })
├── components/organisms/ScheduleFilterBar.tsx
│   ├── lib/db/schema.ts                contentTypes enum
│   └── lib/constants/schedules.ts      contentTypeLabels
└── components/organisms/ScheduleTable.tsx
    ├── lib/constants/schedules.ts
    ├── lib/colorHash.ts                hashTone()
    ├── components/atoms/Badge.tsx
    └── lib/actions/schedules.ts        deleteSchedule()

app/admin/(console)/schedules/new/page.tsx
app/admin/(console)/schedules/[id]/page.tsx
├── lib/actions/schedules.ts            createSchedule() / getSchedule(), updateSchedule()
└── components/organisms/ScheduleForm.tsx
    ├── lib/db/schema.ts                (targetAudiences, bossTiers 등 관련 enum)
    └── lib/constants/schedules.ts

app/admin/(console)/schedules/[id]/dungeon/page.tsx
├── lib/actions/schedules.ts            getSchedule()
├── lib/actions/dungeonRuns.ts          getDungeonRun(), saveDungeonRun()
├── lib/actions/participations.ts       getParticipationsForSchedule()
├── components/organisms/DungeonRunForm.tsx
│   └── lib/constants/dungeonRuns.ts
└── components/organisms/ParticipationTable.tsx
    ├── lib/constants/participations.ts
    └── lib/actions/participations.ts   saveParticipation()

app/admin/(console)/schedules/[id]/participation/page.tsx
├── lib/actions/schedules.ts            getSchedule()
├── lib/actions/participations.ts       getParticipationsForSchedule()
├── lib/constants/schedules.ts          contentTypeLabels
└── components/organisms/ParticipationTable.tsx   (showTicket={type === "abyss"})
```

## 참고

- `contentTypes` enum(`lib/db/schema.ts`)이 이 기능뿐 아니라 회원용 출석 체크(`/attendance`)·대시보드 일정 카드·통장 정산(고대성채/쟁탈전 구분)까지 여러 기능에서 재사용됩니다 — 종류를 추가/변경하면 영향 범위가 넓습니다.
- 어비스(`type === "abyss"`)는 참여 체크 화면에 "레벨 55 이상 입장 가능 · 심연의 초대장 보유 여부 확인" 안내와 `ticketStatus` 컬럼이 추가로 노출됩니다.
