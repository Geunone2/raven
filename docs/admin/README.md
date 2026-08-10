# 관리자 콘솔 (`/admin/**`) 문서 인덱스

운영진 전용 콘솔. 회원용 세션과 별도의 관리자 세션(쿠키)으로 인증하며, 회원 로그인 없이도 독립적으로 접근합니다.

- [01-auth-dashboard.md](./01-auth-dashboard.md) — 로그인 + 대시보드
- [02-members.md](./02-members.md) — 길드원 관리
- [03-schedules.md](./03-schedules.md) — 콘텐츠 일정표 (+ 길드 던전 기록, 참여 체크)
- [04-loots.md](./04-loots.md) — 보상 분배 (전리품/경매)
- [05-boss-timers.md](./05-boss-timers.md) — 보스 타이머
- [06-bank.md](./06-bank.md) — 통장 관리 (길드 공용 통장 + 정산 실행 + 개인 통장 조정)
- [07-announcements.md](./07-announcements.md) — 공지사항

## 공통 구조

- **레이아웃**: `app/admin/(console)/layout.tsx`가 모든 콘솔 페이지를 감싸며, 좌측에 `components/organisms/AdminSidebar.tsx` 고정 사이드바를 붙입니다. 새 관리자 페이지를 추가하면 `AdminSidebar.tsx`의 `navItems` 배열에 직접 등록해야 사이드바에 노출됩니다(자동 감지 없음).
- **인증**: `lib/auth/adminSession.ts`의 `requireAdmin()`을 모든 관리자 전용 서버 액션(`lib/actions/*.ts`)이 개별적으로 호출합니다 — 라우트 매처(프록시)가 커버하지 못하는 경우를 대비한 방어적 이중 체크입니다(주석 참고). 로그인 자체는 `lib/actions/adminAuth.ts`의 `adminLogin`/`adminLogout`이 처리하며, `.env.local`의 `ADMIN_EMAIL`/`ADMIN_PASSWORD`와 상수 시간 비교(`timingSafeEqual`)로 검증합니다. 세션 토큰 서명/검증은 `lib/auth/adminToken.ts`.
- **관례**: 모든 목록형 페이지가 "필터바 + 테이블 + (있으면) 등록 버튼" 패턴이고, 등록/수정은 `new/page.tsx` + `[id]/page.tsx`가 같은 `<Form>` 컴포넌트를 공유하며 수정 시 `action={update함수.bind(null, id)}`로 서버 액션에 id를 미리 묶는 패턴을 씁니다.

## 참고

- **`/admin/attendance`는 존재하지 않습니다.** 예전에 있었던 구 출석 체크 관리자 CRUD(`attendance_events`/`attendance_records` 기반)는 회원 셀프서비스 체크인 플로우가 오래 전에 삭제된 이후 실제 쓰기 경로가 전혀 없는 죽은 화면이었음을 확인하고, 이번 세션에 페이지·액션·컴포넌트를 전부 삭제했습니다. 현재 출석 체크는 `content_schedules`+`schedule_checkins` 기반이며 회원이 `/attendance`에서 직접 셀프서비스로 응답하고, 관리자 쪽에는 그 데이터를 보는 전용 화면이 없습니다(참여 체크/기록은 아래 별개의 `participations` 테이블로 관리자가 직접 기록).
- 이 문서 세트는 사용자 페이지 문서([`docs/pages/`](../pages/))와 짝을 이룹니다. 특히 통장/정산은 실제 계산 로직과 실행 버튼이 전부 여기(관리자 콘솔)에 있고, 사용자 페이지 쪽(`/bank`)은 결과 조회 + 예측 계산기만 제공하니 [06-bank.md](./06-bank.md)와 [`docs/pages/08-bank.md`](../pages/08-bank.md)를 같이 보세요.
