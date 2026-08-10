# 인증 (`/login`, `/signup`)

## 목적/기능

- `/login`: 닉네임 + 비밀번호로 로그인. `?error=1` 쿼리로 실패 메시지 표시.
- `/signup`: 닉네임 + 비밀번호(8자 이상) + 비밀번호 확인만으로 즉시 가입(승인 절차 없음). `?error=duplicate`(닉네임 중복) / `?error=invalid`(비밀번호 조건 불충족) 두 가지 에러 케이스.
- 전투력(공격력/방어력/명중)은 가입 폼에 없고, 가입 후 `/ranking`의 `SelfProfileForm`에서 본인이 직접 입력합니다 ([03-ranking.md](./03-ranking.md) 참고).
- 두 페이지 모두 `<form action={서버액션}>` 방식(별도 `useActionState` 클라이언트 컴포넌트 없이, 서버 액션이 실패 시 `redirect(...?error=...)`로 리다이렉트).

## 파일 구성

```
app/(user)/login/page.tsx
app/(user)/signup/page.tsx
├── lib/actions/auth.ts          login(), signup()
├── components/molecules/FormField.tsx
├── components/atoms/Input.tsx
└── components/atoms/Button.tsx
```

## 참고

- 세션 쿠키 발급/검증은 `lib/auth/session.ts` (HMAC 서명, `raven_session` 쿠키, 30일 유지). 관리자 로그인(`/admin/login`)은 완전히 별개의 `lib/auth/adminSession.ts`를 사용합니다.
- `logout()`도 `lib/actions/auth.ts`에 있으며, 헤더의 로그아웃 폼에서 사용됩니다(이 문서의 대상은 아님, `components/organisms/Header.tsx` 참고).
