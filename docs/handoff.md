# 레이븐2 리더 길드 관리 앱 — 개발 인수인계 문서

작성일: 2026-07-28
작성자: (AI 페어 프로그래밍 세션 요약)

이 문서는 지금까지 진행된 작업 내용과 프로젝트 구조, 개발 시 반드시 지켜야 하는 관례들을 정리한 것입니다. 원본 기획 문서는 `docs/raven_guild_managment_plan.md`에 있지만, **실제 구현은 기획 문서와 다른 부분이 있으니 이 문서와 실제 코드를 우선으로 참고하세요.**

---

## 1. 프로젝트 개요

게임 **Raven2(레이븐2)**의 길드 운영을 위한 웹 앱입니다. 길드원 관리, 콘텐츠 일정표, 전리품(경매) 분배, 랭킹, 공지사항, 통장(길드 자금), 보스 타이머, 출석 체크 등을 제공합니다. 크게 두 영역으로 나뉩니다.

- **`/` 이하 (회원용)**: 로그인한 길드원이 보는 대시보드 및 각 기능 페이지
- **`/admin` 이하 (운영진용)**: 콘텐츠/데이터를 등록·수정·삭제하는 관리자 콘솔 (별도 관리자 로그인 필요)

---

## 2. ⚠️ 가장 먼저 읽어야 할 것 — `AGENTS.md`

프로젝트 루트의 `AGENTS.md` (그리고 `CLAUDE.md`에서 이를 import)는 다음과 같이 명시합니다:

> 이 Next.js는 학습 데이터에 있는 Next.js와 다릅니다. Breaking change가 있으므로, 코드를 작성하기 전에 `node_modules/next/dist/docs/`의 관련 가이드를 반드시 읽으세요.

실제로 이 프로젝트는 **Next.js 16.2.10**을 사용하며, App Router 관례 중 일부가 익숙한 것과 다를 수 있습니다. AI로 작업하든 사람이 작업하든, Next.js 관련 새 코드를 작성하기 전에 로컬 문서를 확인하는 습관을 들이세요.

---

## 3. 로컬 개발 환경 시작하기

```bash
pnpm install
pnpm dev          # http://localhost:3000
```

### 환경 변수 (`.env.local`, 이미 gitignore 처리됨)

레포에 값은 커밋되어 있지 않습니다. 아래 3개 키가 필요하며, **현재 작업자에게 직접 값을 전달받아야 합니다** (이 문서에는 보안상 값을 적지 않습니다):

```
SESSION_SECRET=<회원 세션 쿠키 서명용 시크릿>
ADMIN_EMAIL=<관리자 로그인 이메일>
ADMIN_PASSWORD=<관리자 로그인 비밀번호>
```

### 데이터베이스

- SQLite, 파일 경로 `data/raven.db` (gitignore됨 — 로컬마다 파일이 있어야 함, 없으면 마이그레이션으로 새로 생성)
- ORM: Drizzle ORM (`lib/db/schema.ts`가 단일 스키마 소스)
- 마이그레이션 명령:
  ```bash
  pnpm db:generate   # schema.ts 변경 후 마이그레이션 SQL 파일 생성 (lib/db/migrations/)
  pnpm db:migrate    # 생성된 마이그레이션을 data/raven.db에 적용
  ```
- 현재 마이그레이션은 `0000`~`0015`까지 적용되어 있습니다(`lib/db/migrations/`).
- **스키마를 바꿀 때는 항상 additive(컬럼 추가)하게 작성하세요.** 지금까지 모든 마이그레이션이 그렇게 진행되어 왔고, 기존 데이터를 깨뜨리지 않기 위한 이 프로젝트의 관례입니다.

### 시드 데이터 (현재 로컬 DB 기준, 2026-07-28)

- 길드원 36명 (테스트 계정 비밀번호는 전부 `temporary1234` — 실제 로그인 정보 아님)
- 전리품(경매) 11건 (`distribution_method = 'auction'`)
- 출석 체크 이벤트 4건
- 보스 타이머 5건 (고정 시간 1 + 어비스 4)
- 리더 공지 1건

관리자 계정은 `.env.local`의 `ADMIN_EMAIL`/`ADMIN_PASSWORD`로 `/admin/login`에서 로그인합니다.

---

## 4. 기술 스택

| 영역 | 선택 |
|---|---|
| 프레임워크 | Next.js 16.2.10 (App Router) |
| UI | React 19 |
| 스타일 | Tailwind CSS v4 (`@theme` 기반 디자인 토큰, `app/design-tokens.css`) |
| DB | SQLite (`better-sqlite3`) + Drizzle ORM |
| 캘린더 | `react-day-picker` |
| 캐러셀 | `embla-carousel-react` + `embla-carousel-autoplay` (경매 카드에서 사용) |
| 애니메이션 | `motion` (Framer Motion 후신, `motion/react`에서 import — `framer-motion` 아님) |
| 아이콘 | `lucide-react` |

테스트 프레임워크는 아직 없습니다(단위/통합 테스트 미구성). 검증은 `tsc --noEmit` + `pnpm lint` + 실제 `curl` 기반 수동 검증으로 진행해왔습니다(6번 섹션 참고).

---

## 5. 디렉토리 구조 및 핵심 관례

```
app/
  (user)/          # 회원용 라우트 그룹 (레이아웃에 헤더/네비 포함)
    page.tsx       # 홈 대시보드 — 가장 복잡한 페이지, 8번 섹션에서 자세히 설명
    attendance/, auctions/, bank/, notices/, ranking/, schedule/, login/, signup/ ...
  admin/
    login/
    (console)/     # 관리자 콘솔 라우트 그룹 (사이드바 레이아웃)
      members/, schedules/, loots/, boss-timers/, attendance/, bank/, announcements/

lib/
  db/
    schema.ts      # 전체 DB 스키마 (11개 테이블, 아래 7번 섹션 참고)
    client.ts       # better-sqlite3 + drizzle 클라이언트
    migrations/     # drizzle-kit generate 결과물
  actions/          # "use server" 파일들 — Server Actions만 존재
  constants/        # 각 도메인의 라벨/색상 매핑, 순수 함수 (아래 참고)
  auth/             # 세션(회원)/adminSession(관리자) 각각 별도 쿠키 기반 인증
  hooks/            # 클라이언트 훅 (현재 useLiveNow 하나)
  time.ts           # 날짜/시간 관련 공용 유틸 (아주 중요, 6-2번 참고)
  colorHash.ts       # 자유 텍스트 라벨용 결정적 색상 해시

components/
  atoms/            # Badge, Button, Input 등 최소 단위. 재사용 카운트다운/타이머 UI도 여기.
  molecules/        # FormField 등
  organisms/        # 실제 기능 단위 컴포넌트 (카드, 폼, 테이블 등 대부분 여기)
```

### ⚠️ 매우 중요한 규칙: `"use server"` 파일 제약

`lib/actions/*.ts` 파일 최상단에 `"use server"`가 있는 파일은 **async 함수만 export할 수 있습니다.** 상수, 타입, 동기 순수 함수를 여기에 두면 빌드 에러가 납니다. 그래서 이 프로젝트는 관례적으로 도메인마다 파일을 분리합니다:

- `lib/actions/<domain>.ts` — 서버 액션 (DB read/write, redirect, revalidatePath)
- `lib/constants/<domain>.ts` — 라벨 맵, 색상(tone) 맵, 순수 계산 함수

새 기능을 추가할 때 "이 함수를 액션 파일에 넣었는데 빌드가 깨진다"면 거의 항상 이 규칙 때문입니다.

---

## 6. 반드시 알아야 할 아키텍처 패턴

### 6-1. 디자인 시스템 — 시맨틱 토큰만 사용

`app/design-tokens.css`의 `@theme` 블록에 모든 색상이 정의되어 있고, 컴포넌트는 `bg-surface`, `text-ink`, `border-edge` 같은 **시맨틱 클래스만** 사용합니다. 원시 Tailwind 팔레트 클래스(`bg-blue-500` 등)나 `dark:` variant는 이 프로젝트에 없습니다 — 대신 다크모드는 같은 파일 하단의 `@media (prefers-color-scheme: dark)` / `:root[data-theme="dark"]` 블록에서 동일한 커스텀 프로퍼티를 재정의하는 방식으로 구현되어 있습니다(2026-08-13). 기본은 시스템 설정을 따르고, 헤더의 `ThemeToggle`(`components/atoms/ThemeToggle.tsx`)로 `<html data-theme="light|dark">`를 강제 지정해 수동 전환도 가능합니다(선택값은 `lib/theme.ts`를 통해 `localStorage`에 저장). 브랜드/상태색 버튼의 흰 글자는 `text-surface`가 아니라 `text-ink-inverse`(라이트/다크 공용 고정 흰색)를 씁니다 — `surface`는 다크모드에서 거의 검정으로 뒤집히므로 헷갈리지 마세요.

현재 토큰 그룹:
- 기본: surface/edge/ink/brand/danger/success/warning
- 랭킹 카드 색상: `rank-total/attack/defense/accuracy`
- 순위 배지: `medal-gold/silver/bronze`
- 전리품 등급: `grade-legendary/hero/rare`
- 전리품 종류: `category-weapon/armor/accessory/heavenstone/skillbook/other`
- 자유 텍스트용 범용 팔레트: `swatch-1`~`swatch-5` (아래 6-4 참고)
- 콘텐츠 종류(출석체크/일정표 공용): `content-guild-dungeon/abyss/field-boss/rift/ancient-fortress/other`

`components/atoms/Badge.tsx`가 이 색상들을 `tone` prop으로 매핑합니다(`Tone` 타입을 export하고 있으니 새 tone 추가 시 이 파일 하나만 건드리면 됨). **새 배지 색상이 필요하면 반드시 여기에 토큰+tone을 추가하는 방식을 따르세요.** 템플릿 리터럴로 동적 Tailwind 클래스명을 만들면(`` `text-${var}` ``) Tailwind JIT가 인식하지 못해 스타일이 깨집니다 — 실제로 이 실수를 한 번 했다가 고쳤습니다(`AttendanceRecordList.tsx` 히스토리 참고).

### 6-2. 날짜/시간 처리 — 두 가지 문자열 포맷을 절대 섞지 말 것

`lib/time.ts` 상단 주석에 명시되어 있지만, 실수하기 매우 쉬운 부분이라 여기서도 강조합니다.

1. **SQLite `CURRENT_TIMESTAMP` 컬럼** (`created_at` 등): `"YYYY-MM-DD HH:MM:SS"` 형식이며 **UTC**입니다. 타임존 마커가 없어서 그냥 `new Date(str)`로 파싱하면 로컬시간으로 잘못 해석됩니다. 반드시 `toEpochMs()` 또는 `formatMonthDay()`를 거쳐야 합니다.
2. **`<input type="datetime-local">` 값** (경매 마감일 `bidDeadline`, 출석체크 마감일 `deadline` 등): `"YYYY-MM-DDTHH:MM"` 형식이며 **로컬 시간**입니다. 그냥 `new Date(str)`로 파싱하는 게 맞고, `toEpochMs()`를 쓰면 안 됩니다(UTC로 강제 변환되어 버그가 생김 — 실제로 이 버그를 만들었다가 배포 전에 잡았습니다). `formatMonthDayTime()` / `formatRemainingTime()`을 사용하세요.

새로운 날짜/시간 필드를 추가할 때는 반드시 어느 쪽인지 먼저 판단하고, `lib/time.ts`의 기존 함수를 재사용하세요.

### 6-3. 실시간 카운트다운 / 애니메이션 유틸

- `lib/hooks/useLiveNow.ts` — 클라이언트에서 1초마다 갱신되는 `Date | null`을 반환하는 훅(마운트 전에는 `null` → SSR과 하이드레이션 불일치 방지). 새로운 실시간 타이머가 필요하면 이 훅을 재사용하세요, `useEffect`+`setInterval`을 새로 만들지 마세요.
- `lib/time.ts`의 `formatRemainingTime(deadline, now)` — "D일 HH:MM:SS 남음" 형식 텍스트 계산(순수 함수, `now`를 인자로 받으므로 서버/클라이언트 어디서든 재사용 가능).
- `components/atoms/TimerIcon.tsx` — `lucide-react`의 `Timer` 아이콘 + `animate-pulse`. 타이머가 있는 곳엔 항상 이 컴포넌트를 씁니다.
- `components/atoms/RouletteText.tsx` — 숫자 하나하나가 슬롯머신처럼 롤링되는 애니메이션 텍스트(`motion/react` 사용). 카운트다운 표시에 항상 이걸로 감쌉니다.
- `components/atoms/LootBidCountdown.tsx`, `components/atoms/AttendanceCountdown.tsx` — 위 세 가지를 조합한 도메인별 "use client" 리프 컴포넌트. 서버 컴포넌트 안에 이런 작은 클라이언트 리프를 박아 넣는 패턴을 계속 씁니다(카드 전체를 클라이언트 컴포넌트로 만들지 않기 위함 — 단, `AuctionCard`는 캐러셀 때문에 예외적으로 전체가 `"use client"`입니다).

### 6-4. 자유 텍스트 라벨 색상 — `hashTone()`

등급/종류처럼 고정된 enum이 아니라 관리자가 자유롭게 입력하는 텍스트(길드명, 서버명 등)에 색을 입혀야 할 때는 `lib/colorHash.ts`의 `hashTone(value: string): Tone`을 씁니다. 문자열 해시로 `swatch1`~`swatch5` 중 하나를 결정적으로 골라줘서, 같은 값은 항상 같은 색이 됩니다.

### 6-5. 반응형 브레이크포인트 관례

이 앱은 `sm`(모바일 가로/작은 태블릿), `md`(태블릿), `xl`(PC, 1280px+) 세 단계를 씁니다. **`lg`(1024px)는 쓰지 않습니다** — iPad Pro 11 가로모드(1194px)가 `lg` 기준으로는 "PC"로 잘못 분류되는 버그가 있어서 전부 `xl`로 올렸습니다. 새 반응형 UI를 만들 때 `lg:` 클래스를 쓰지 마세요.

헤더는 `xl` 미만에서 햄버거 메뉴(`components/organisms/MobileNav.tsx`)로 바뀌고, 이상에서는 가로 네비게이션(`Header.tsx`)이 보입니다. `Header`는 `sticky top-0 z-30`이라 스크롤해도 고정되며, z-index를 명시적으로 주지 않으면 나중에 렌더되는 다른 `position: relative` 요소(달력 등)에 덮인다는 걸 실제로 겪었으니 주의하세요.

### 6-6. 서버 액션 검증 워크플로우 (curl 기반)

이 프로젝트는 자동화된 테스트가 없는 대신, **매 기능마다 실제 로그인 → 실제 폼 제출 → DB 확인**을 curl로 진행해왔습니다. 새 기능을 검증할 때 참고하세요.

```bash
# 회원 로그인 (테스트 계정, 비밀번호 temporary1234)
curl -s -c cookies.txt http://localhost:3000/login -o login.html
# login.html에서 폼 안의 $ACTION_ID_xxx 히든 필드를 정확히 그 <form> 범위 안에서 찾아야 함
# (주의: 페이지에 로그아웃 폼도 항상 있어서, 첫 번째 $ACTION_ID_를 그냥 grep하면 엉뚱한 폼을 잡을 수 있음)
curl -s -b cookies.txt -c cookies.txt -X POST http://localhost:3000/login \
  -F '$ACTION_ID_<추출한값>=' -F 'nickname=검은매' -F 'password=temporary1234'

# 관리자 로그인은 동일한 방식으로 /admin/login, .env.local의 ADMIN_EMAIL/ADMIN_PASSWORD 사용

# .bind()로 인자가 묶인 서버 액션(예: setMyAttendance.bind(null, eventId))은
# $ACTION_REF_n / $ACTION_n:0 / $ACTION_n:1 세 개의 히든 필드가 생기며, 그대로 같이 전송해야 함
```

검증 후에는 실제로 넣은 테스트 데이터를 정리(삭제)하는 습관을 지켜왔습니다(실 시드 데이터와 검증용 임시 데이터를 섞지 않기 위함) — `sqlite3 data/raven.db "DELETE FROM ..."`로 직접 지우는 방식을 주로 썼습니다.

---

## 7. 데이터베이스 스키마 요약 (`lib/db/schema.ts`)

| 테이블 | 용도 | 비고 |
|---|---|---|
| `guild_members` | 길드원 (닉네임/비밀번호 해시/직업/스탯/역할) | `nickname` unique, 자체 회원가입(`/signup`) |
| `announcements` | 리더 공지사항 | `isPinned`로 상단 고정, 카테고리 enum |
| `content_schedules` | 콘텐츠 일정표 (길드던전/어비스/필드보스/균열/고대성채/기타) | `contentTypes` enum이 여러 기능에서 재사용됨(출석체크 포함) |
| `participations` | 일정별 회원 참여 상태 (사전 RSVP + 관리자가 기록하는 실제 참여 결과) | `plannedStatus`/`actualStatus` 이원화. **주의**: 예전에 있던 자체 체크인 플로우(`/checkin`)는 삭제되고 지금은 관리자 화면(`ParticipationTable`)에서만 씀 — 8-8번 참고 |
| `guild_dungeon_runs` | 길드 던전 결과 기록 | `content_schedules`와 1:1 |
| `loots` | 전리품/분배 대상 아이템 | 경매 관련 필드(등급/종류/판매금액/보관길드/마감일) 포함 |
| `loot_bids` | 경매 입찰 기록 | `(lootId, memberId)` unique — 같은 사람이 다시 입찰하면 upsert |
| `bank_transactions` | 길드 통장 입출금 내역 | 잔액은 저장하지 않고 매번 합산 계산 |
| `boss_timers` | 보스 타이머 (고정시간/리젠형/어비스 수·일 두 종류) | `getNextSpawnAt()` (`lib/constants/bossTimers.ts`)가 다음 출현 시각을 매 렌더마다 계산 |
| `attendance_events` | (사용 안 함) 구 출석 체크 이벤트 테이블 | `content_schedules`+`schedule_checkins`로 대체되어 관련 코드 전부 삭제됨. additive-only 마이그레이션 관례상 테이블만 남아있음 — 8-4번 참고 |
| `attendance_records` | (사용 안 함) 구 출석 체크 응답 테이블 | 위와 동일 |

---

## 8. 기능별 구현 현황

### 8-1. 회원 인증/가입
`/signup`에서 닉네임+비밀번호만으로 즉시 가입(승인 절차 없음 — 예전에 있던 길드가입 신청 기능은 명시적으로 삭제됨). 콤뱃 스탯은 가입 후 `/ranking`의 `SelfProfileForm`에서 본인이 직접 입력.

### 8-2. 홈 대시보드 (`app/(user)/page.tsx`)
가장 복잡한 페이지입니다. 현재 레이아웃은 두 개의 `grid-cols-12` 블록으로 구성됩니다(`xl` 기준 각각 3/6/3 분할).

**1행**
- 좌(3): 오늘의 일정 (`ScheduleCalendar`)
- 중(6): [공식 포럼 소식 | 리더 공지사항] 나란히 + 그 아래 출석체크 카드(전체폭)
- 우(3): 내 정보(`MyInfoCard`) → 보스 타이머(`BossTimerCard`) → 커뮤니티(`CommunityCard`, **아직 미구현 placeholder**)

**2행**
- 좌(3): 총합 랭킹
- 중(6): 경매(내판) 캐러셀 카드 + 그 아래 [공격력 랭킹 | 방어력 랭킹] 나란히
- 우(3): 명중 랭킹

반응형: `sm`/`md`/`xl` 세 단계(6-5번 참고). 이 레이아웃은 사용자가 직접 그림으로 확정한 스펙을 그대로 구현한 것이며, `xl` 기준으로만 실제 확인되었고 좁은 화면은 기존에 검증됐던 반응형 스캐폴딩을 재사용만 한 상태입니다(브라우저 도구가 없어 직접 스크린샷 확인은 못 함) — **좁은 화면 레이아웃이 깨져 보이면 가장 먼저 의심할 부분입니다.**

### 8-3. 경매(내판) — `AuctionCard`(홈) / `AuctionList`(`/auctions` 전체보기)
- `loots` 테이블 중 `distribution_method='auction'`이고 `status != 'completed'`인 것만 노출
- 마감 임박 순 정렬
- 홈 카드는 `embla-carousel-react`로 5초마다 자동 슬라이드(점 인디케이터만, 화살표 없음)
- 카드 항목: 등급/종류/보관길드 배지(전부 색상 있음) → 아이템명 + 실시간 카운트다운 → 판매금액 → 최고입찰/입찰자 수 → "입찰하기" 버튼(전체보기 페이지로 링크)
- 실제 입찰/낙찰 로직은 `/auctions` 페이지(`AuctionList`)에 있음 — 한동안 "나중에 더 자세히 스펙을 주겠다"며 유보됐던 페이지였으나, 지금의 최소 스펙 그대로 **완료로 확정됨(2026-08-13)**. 자세한 내용은 [`docs/pages/06-auctions.md`](./pages/06-auctions.md), [`docs/pages/00-roadmap.md`](./pages/00-roadmap.md) 참고.

### 8-4. 출석 체크 (`/attendance`)
이 섹션은 최초 구현(`attendance_events`/`attendance_records` 기반, 자체 admin CRUD 포함) 당시 기준이라 지금은 아키텍처가 바뀌었습니다. **최신 설명은 [`docs/pages/05-attendance.md`](./pages/05-attendance.md)를 참고하세요.** 요약하면: 지금은 `content_schedules` + `schedule_checkins` 기반으로 재구현되어 있고(2주 기여도 집계, 통장 정산 계산기와 점수 공식 공유), 옛 `attendance_events`/`attendance_records`와 그 admin CRUD(`/admin/attendance`, `lib/actions/attendance.ts`)는 실제 쓰기 경로가 이미 사라진 죽은 코드였음을 확인하고 전부 삭제했습니다. 예전에 있던 `/checkin`(별개의 `content_schedules` 기반 사전 RSVP 셀프서비스)도 그 이전에 이미 삭제된 상태였고, `participations` 테이블과 관리자용 참여 기록 기능(`ParticipationTable`, `saveParticipation`)은 이 출석 체크와는 무관하게 계속 살아 있습니다.

### 8-5. 랭킹
`/ranking`, 홈 대시보드에 4개 카드(총합/공격력/방어력/명중). 총합만 TOP 20, 나머지는 TOP 10. 등수 1~3위는 메달 색상 배지.

### 8-6. 공지사항 통합 피드 (`/notices`)
리더 공지 + 공식 포럼 3개 게시판(공지/업데이트/개발자노트)을 합쳐서 검색/무한스크롤로 보여주는 페이지. `lib/actions/notices.ts`의 `UnifiedNotice` 타입으로 통일. 상세 페이지는 `/notices/[key]`.

### 8-7. 보스 타이머
고정 시간형(`fixed`) / 리젠형(`respawn`, 마지막 처치 시각 기록 필요) / 어비스 수·일형(`weekly_wed_sun`, `weekly_sunday`) 네 종류. 다음 출현 시각은 DB에 저장하지 않고 렌더마다 계산(`getNextSpawnAt`).

### 8-8. 통장 (`/bank`)
잔액을 저장하지 않고 `bank_transactions`를 매번 합산해서 계산.

### 8-9. 관리자 콘솔
`/admin/members`, `/admin/schedules`, `/admin/loots`, `/admin/boss-timers`, `/admin/bank`, `/admin/announcements`. 전부 같은 패턴(목록 테이블 + 등록/수정 폼, `AdminSidebar.tsx`에 네비 등록).

---

## 9. 알려진 이슈 / 기술 부채

1. **`lib/hooks/useLiveNow.ts`의 lint 에러는 더 이상 재현되지 않음(2026-08-13 확인)** — 이 문서엔 원래 "`pnpm lint` 실행 시 `react-hooks/set-state-in-effect` 에러가 항상 뜬다"고 적혀 있었는데, 이번 세션에 `pnpm lint`를 돌려보니 에러 0건(무관한 warning 4건만)이었습니다. 언제/왜 없어졌는지는 확인하지 않았으니, 관련 코드를 만질 일이 있으면 실제로 재현되는지 다시 확인하세요.
2. **자동화 테스트 없음** — 모든 검증은 `tsc`/`lint` + 수동 curl 검증으로 진행됨
3. **좁은 화면(모바일/태블릿) 반응형이 최신 대시보드 재배치 이후 실제 화면으로 검증되지 않음** (8-2번 참고) — 사용자가 가장 마지막에 진행하기로 함(2026-08-13)
4. **커뮤니티(디스코드/오픈카카오톡) 카드는 실제 링크가 연결되어 있음, placeholder 아님** (`components/organisms/CommunityCard.tsx`) — 이 문서에 예전엔 "순수 placeholder"라고 적혀 있었으나 사실이 아니었음을 확인(2026-08-11 `docs/pages/00-roadmap.md`에서 먼저 정정됨)

---

## 10. 다음에 할 만한 작업 (제안, 확정된 것 아님)

- 좁은 화면 대시보드 레이아웃 실기기 검증 (가장 마지막에 진행하기로 함, 2026-08-13)
- 관리자 콘솔(`app/admin/**`) 전용 로드맵 문서 작성 (2026-08-13 기준 아직 없음, 사용자가 추후 진행하기로 함)

완료됨: `/auctions` 스펙 확정(2026-08-13, [8-3번](#8-3-경매내판--auctioncard홈-auctionlist-auctions-전체보기) 참고) · 커뮤니티 카드 링크 연결 · 다크모드(시스템 설정 + 수동 토글 버튼, 2026-08-13) 구현.

---

## 11. Git 상태 주의사항

이 저장소는 **`416c9aa Initial commit from Create Next App` 이후 커밋이 하나도 없습니다.** 지금까지의 모든 작업(이 문서에 정리된 기능 전부 포함)이 아직 커밋되지 않은 워킹 디렉토리 변경사항입니다. `git status`로 반드시 확인 후 작업을 이어가세요. 이 프로젝트는 "기능이 어느 정도 완성될 때까지 커밋하지 않는다"는 방식으로 진행되어 왔으니, 커밋 시점은 팀 판단에 맞게 정하시면 됩니다.
