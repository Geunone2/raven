# 길드원 관리 (`/admin/members`)

## 목적/기능

길드원 목록 조회(닉네임/역할 필터, `MemberFilterBar`)와 수정(`/admin/members/[id]`). **등록 페이지는 없습니다** — 회원가입은 `/signup`에서 본인이 직접 진행하는 구조라, 관리자는 기존 회원의 역할/직업/스탯 등을 수정하거나 삭제만 할 수 있습니다.

## 파일 구성

```
app/admin/(console)/members/page.tsx
├── lib/actions/members.ts              getMembers({ q, role })
├── components/organisms/MemberFilterBar.tsx   ("use client" 아님, 폼 GET 제출)
│   ├── lib/db/schema.ts                guildMemberRoles enum
│   └── lib/constants/members.ts        roleLabels
└── components/organisms/MemberTable.tsx
    ├── lib/constants/members.ts        roleLabels
    ├── components/atoms/Badge.tsx
    └── lib/actions/members.ts          deleteMember()

app/admin/(console)/members/[id]/page.tsx
├── lib/actions/members.ts              getMember(), updateMember()
└── components/organisms/MemberForm.tsx
    ├── lib/db/schema.ts                guildMemberRoles enum
    └── lib/constants/members.ts        roleLabels
```

## 참고

- `guild_members` 테이블이 대상. 비밀번호 해시는 이 화면에서 다루지 않습니다(관리자가 회원 비밀번호를 재설정하는 기능 없음).
- 전투력(공격력/방어력/명중)은 회원 본인이 `/ranking`의 `SelfProfileForm`에서 직접 입력하는 값이라, 이 관리자 폼에서도 수정 가능하지만 1차 입력 경로는 아닙니다.
