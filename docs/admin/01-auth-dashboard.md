# 로그인 / 대시보드

## 목적/기능

### `/admin/login`
이메일+비밀번호 로그인 폼. `.env.local`의 `ADMIN_EMAIL`/`ADMIN_PASSWORD`와 상수 시간 비교로 검증하는 단일 관리자 계정 방식입니다(회원처럼 여러 명의 관리자 계정을 DB에 두는 구조가 아님). 이미 로그인된 상태면 `/admin`으로 리다이렉트.

### `/admin` (대시보드)
운영진이 콘솔에 들어왔을 때 가장 먼저 보는 요약 화면. 별도 카드 컴포넌트 없이 페이지 자체에서 조합합니다.

- 등록된 길드원 수 + "길드원 관리" 링크
- 분배 대기 전리품 건수(`countPendingLoots()`) + "보상 분배" 링크
- 오늘의 일정 목록 (`getTodaySchedules()`, 없으면 "오늘 예정된 콘텐츠가 없습니다")
- 고정 공지 목록 (`announcements.isPinned`인 것만, 있을 때만 섹션 노출)

## 파일 구성

```
app/admin/login/page.tsx
├── lib/actions/adminAuth.ts            adminLogin()
├── lib/auth/adminSession.ts            isAdminAuthenticated()
├── components/molecules/FormField.tsx
├── components/atoms/Input.tsx
└── components/atoms/Button.tsx

app/admin/(console)/page.tsx
├── lib/actions/members.ts              getMembers()
├── lib/actions/announcements.ts        getAnnouncements()
├── lib/actions/schedules.ts            getTodaySchedules()
├── lib/actions/loots.ts                countPendingLoots()
└── lib/constants/schedules.ts          contentTypeLabels
```

## 참고

- 로그아웃 버튼은 이 페이지들이 아니라 `AdminSidebar.tsx`에 상시 노출되는 폼(`action={adminLogout}`)입니다.
- 대시보드는 순수 요약/링크 모음이라 자체 컴포넌트가 없고, 각 섹션의 실제 상세 화면은 각각의 기능 문서(02~07)를 참고하세요.
