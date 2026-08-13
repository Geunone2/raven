# 로드맵 / 남은 작업 (2026-08-13 기준)

실제 코드 상태를 확인해서 작성한 "지금 무엇이 끝났고 무엇이 남았는지" 목록입니다. 제안이나 의사결정 문서가 아니라 현황 인벤토리이며, 리팩토링을 시작하기 전에 가장 먼저 읽어야 할 문서입니다.

## 미구현

### 좁은 화면(모바일/태블릿) 반응형 실기기 검증
대시보드가 `grid-cols-12` 2행 레이아웃으로 재배치된 이후, `sm`/`md`/`xl` 각 브레이크포인트가 실제 화면에서 검증된 적이 없습니다(브라우저 도구 없이 작업). `xl` 기준으로만 확인되었고, 통장 페이지의 새 차트(`NetTreasuryChart` 등)를 포함해 이번 세션에 추가된 모든 화면이 동일하게 미검증 상태입니다. **의도적으로 가장 마지막에 진행하기로 함(2026-08-13, 사용자 지시).**

### 자동화 테스트
`package.json`에 `test` 스크립트가 없고 vitest/jest/playwright/cypress 등 테스트 프레임워크 의존성도 없습니다. 검증은 지금도 `tsc --noEmit` + `pnpm lint` + 로그인 세션을 실제로 띄운 뒤 curl로 서버 액션을 호출해 DB 결과를 확인하는 수동 방식으로만 이루어집니다(`docs/handoff.md` 6-6번 참고).

### 좁은 화면(모바일/태블릿) 반응형 실기기 검증
대시보드가 `grid-cols-12` 2행 레이아웃으로 재배치된 이후, `sm`/`md`/`xl` 각 브레이크포인트가 실제 화면에서 검증된 적이 없습니다(브라우저 도구 없이 작업). `xl` 기준으로만 확인되었고, 통장 페이지의 새 차트(`NetTreasuryChart` 등)를 포함해 이번 세션에 추가된 모든 화면이 동일하게 미검증 상태입니다.

## 최근 세션에서 정리/확인된 항목 (더 이상 이슈 아님)

### `/auctions` — 경매 참여 페이지 완료 확정 (2026-08-13)
그동안 "사용자가 나중에 더 자세히 스펙을 주겠다"며 보류해뒀던 항목이었으나, 실제 코드(`app/(user)/auctions/page.tsx`, `AuctionFilterPanel`, `AuctionList`, `AuctionBidButtons`, `lib/actions/loots.ts`)를 확인한 결과 문서에 적힌 최소 스펙(진행중/종료/전체 + 길드 필터, 입찰/입찰취소, 마감 시 최고 전투력 자동 낙찰, 운영진 수동 override)과 실제 구현이 정확히 일치함을 확인했고, 사용자가 이 상태를 최종 완료로 확정했습니다. [06-auctions.md](./06-auctions.md)도 이에 맞춰 보류 경고를 제거했습니다.

### 다크모드 구현 완료 (2026-08-13)
`app/design-tokens.css`에 `@media (prefers-color-scheme: dark)` + `:root[data-theme="dark"]` 두 경로로 다크 팔레트 오버라이드를 추가했습니다. 기본은 시스템 설정(`prefers-color-scheme`)을 따르고, 헤더(데스크톱 네비 + 모바일 메뉴, 로그인/로그아웃 옆)의 토글 버튼으로 시스템 → 라이트 → 다크 순으로 수동 강제 선택도 가능합니다(2026-08-13 추가, `components/atoms/ThemeToggle.tsx`, `lib/theme.ts`). 선택값은 `localStorage`(`raven_theme`)에 저장되고, `app/layout.tsx`의 `beforeInteractive` 스크립트가 페인트 전에 반영해 깜빡임을 막습니다.

진행 과정에서 시맨틱 토큰을 우회하던 raw Tailwind 컬러 클래스(`bg-white`, `text-black`, `text-white` 등)를 쓰던 파일 9개(`Button.tsx`, `ScheduleCheckinButtons.tsx`, `ScheduleCalendar.tsx`, `ScheduleCalendarView.tsx`, `NoticeFeed.tsx`, `ToastProvider.tsx`, `AuctionList.tsx`, `ScheduleCheckinList.tsx`, `RankingCard.tsx`)를 시맨틱 토큰으로 정리했습니다. 이 중 브랜드/상태색 버튼에 흰 글자를 입히던 `text-surface` 패턴은 `surface` 토큰이 다크모드에서 거의 검정으로 뒤집히면서 버튼 글자가 안 보이게 되는 문제가 있어, 새 토큰 `--color-ink-inverse`(고정 흰색, 라이트/다크 공용)를 만들어 분리했습니다.

또한 `public/closed-icon.svg`(경매 마감 스탬프)가 색이 고정된(검정) `<Image>` 자산이라 다크모드 카드 배경에서 안 보이는 문제가 있어, `BankIcons.tsx`와 동일한 방식(`fill="currentColor"` 인라인 SVG)으로 `components/atoms/ClosedStampIcon.tsx`를 새로 만들어 `AuctionList.tsx`/`AuctionCard.tsx`에서 교체했습니다.

`CommunityCard.tsx`의 디스코드/카카오톡 버튼 색(`bg-[#5865F2]`, `bg-[#FEE500]` 등)은 의도적으로 그대로 뒀습니다 — 앱 테마가 아니라 외부 브랜드 고정 색상이라 다크모드와 무관합니다.

수동 토글 스위치는 위에 적힌 대로 완료됨(2026-08-13). `<html>`의 `color-scheme`도 `ThemeToggle`이 설정하는 `[data-theme]` 속성에 따라 `app/globals.css`의 `:root[data-theme="light|dark"]` 규칙이 자동으로 반영합니다.

### 커뮤니티 카드
`docs/handoff.md`(2026-07-28 작성)에는 "순수 placeholder"라고 적혀 있지만, 실제로는 더 이상 사실이 아닙니다. `components/organisms/CommunityCard.tsx`를 직접 확인한 결과 디스코드/카카오톡 오픈채팅 2종(수다방/공지방) 링크가 모두 실제 URL로 연결되어 있습니다. `docs/handoff.md`는 이 부분이 갱신되지 않은 상태이니 주의하세요.

### 고정 공지 정렬 버그
`/notices`에서 "고정" 태그 글이 상단에 오지 않던 버그를 이번 세션에 수정했습니다 — `getAnnouncementsPage()`(`lib/actions/announcements.ts`)와 `getNoticesPage()`의 "전체" 병합 정렬(`lib/actions/notices.ts`)이 `isPinned`를 무시하고 있었습니다. [07-notices.md](./07-notices.md) 참고.

### 랭킹 검색 시 순위 오표시 버그
`/ranking`에서 검색으로 결과가 1명만 남으면 무조건 1등으로 표시되던 버그를 수정했습니다 — 표시되는 배열의 index를 순위로 쓰던 것을, 전체 길드원 기준 순위를 미리 계산한 `rankById` 맵에서 조회하도록 변경했습니다. [03-ranking.md](./03-ranking.md) 참고.

## 통장/정산 기능 관련 후속 작업

이번 세션에 새로 만들어진 통장 정산 기능(장비내판 정산, 고대성채/쟁탈전 정산, 정산 계산기 카드 3종)은 위의 "미구현" 항목들이 동일하게 적용됩니다 — 다크모드 미대응, 좁은 화면 미검증. 그 외 이 기능 자체에 알려진 미결 이슈는 없습니다(정산 공식은 실제 구글시트 수치로 검증 완료, [08-bank.md](./08-bank.md) 참고).

## 문서화 범위 안내

`app/admin/**`(운영진 콘솔)은 이 `docs/pages/` 문서 세트의 범위 밖입니다 — 이번 정리는 사용자 페이지(`app/(user)/**`) 전용입니다. 관리자 콘솔 문서가 필요하면 별도로 진행하세요.
