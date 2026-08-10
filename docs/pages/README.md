# 사용자 페이지 문서 (`docs/pages/`)

이 폴더는 `app/(user)/` 아래 회원용(로그인한 길드원이 보는) 페이지들을 페이지 단위로 정리한 문서입니다. 향후 리팩토링을 준비하기 위해, 각 페이지가 **무엇을 하는지**와 **어떤 파일들에 의존하는지**를 실제 코드 기준으로 기록했습니다.

- 관리자 콘솔(`app/admin/**`)은 이 문서 범위 밖입니다. 필요하면 별도로 진행하세요.
- 프로젝트 전반의 아키텍처/관례(디자인 토큰, 날짜 처리, `"use server"` 제약 등)는 `docs/handoff.md`를 참고하세요. 이 폴더의 문서들은 그 내용을 전제로, 페이지별 상세만 다룹니다.
- 원본 기획 문서(`docs/raven_guild_managment_plan.md`)는 오래되어 실제 구현과 다른 부분이 많으니 참고용으로만 보세요.

## 먼저 읽을 문서

**[00-roadmap.md](./00-roadmap.md)** — 아직 남아있는 작업/보류 항목 목록. 리팩토링을 시작하기 전에 가장 먼저 읽으세요.

## 페이지 목록

| 문서 | 라우트 | 설명 |
|---|---|---|
| [01-dashboard.md](./01-dashboard.md) | `/` | 홈 대시보드 — 일정/공지/출석/랭킹/경매를 한 화면에 모은 가장 복잡한 페이지 |
| [02-auth.md](./02-auth.md) | `/login`, `/signup` | 로그인/회원가입 |
| [03-ranking.md](./03-ranking.md) | `/ranking`, `/ranking/[memberId]` | 전투력 랭킹 조회 + 개인 스탯 추이 상세 |
| [04-schedule.md](./04-schedule.md) | `/schedule` | 콘텐츠 일정표 (카드형/캘린더형) |
| [05-attendance.md](./05-attendance.md) | `/attendance` | 출석 체크 + 2주 기여도 집계 |
| [06-auctions.md](./06-auctions.md) | `/auctions` | 경매(내판) 참여 — **스펙 보류 중, 임의 확장 금지** |
| [07-notices.md](./07-notices.md) | `/notices`, `/notices/[key]` | 공지사항 통합 피드 (리더 공지 + 공식 포럼) |
| [08-bank.md](./08-bank.md) | `/bank`, `/bank/all`, `/bank/income`, `/bank/expense` | 통장 — 길드 공용 통장 + 개인 통장 + 정산 계산기 |
| [09-static-pages.md](./09-static-pages.md) | `/terms`, `/privacy` | 이용약관/개인정보 처리방침 (정적 페이지) |

## 공통 레이아웃

`app/(user)/layout.tsx`가 모든 회원 페이지를 감쌉니다.

- `components/organisms/Header.tsx` — `xl` 이상에서 보이는 가로 네비게이션 (`sticky top-0 z-30`)
- `components/organisms/MobileNav.tsx` — `xl` 미만에서 보이는 햄버거 메뉴
- `components/organisms/Footer.tsx`
- 세션 확인: `lib/auth/session.ts`의 `getSessionMemberId()` — 회원 쿠키(`raven_session`) 기반, HMAC 서명 검증. 관리자 세션(`lib/auth/adminSession.ts`)과는 완전히 별개.
- 로그인한 회원 정보는 레이아웃에서 `getMember(memberId)`(`lib/actions/members.ts`)로 조회해 `Header`에 내려줍니다.
