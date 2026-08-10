# 공지사항 (`/admin/announcements`)

## 목적/기능

`announcements` 테이블(리더 공지) CRUD. 회원용 `/notices` 통합 피드의 "리더공지" 소스가 바로 이 테이블입니다(`docs/pages/07-notices.md` 참고).

- **목록/필터**(`/admin/announcements`): 카테고리(`announcementCategories`)로 필터.
- **등록/수정**(`new`, `[id]`): 카테고리/제목/본문(plain text, whitespace-pre-wrap) + `isPinned` 체크박스 — 켜면 회원용 `/notices`에서 날짜와 무관하게 항상 최상단에 고정됩니다.

## 파일 구성

```
app/admin/(console)/announcements/page.tsx
├── lib/actions/announcements.ts        getAnnouncements({ category })
├── components/organisms/AnnouncementFilterBar.tsx
│   ├── lib/db/schema.ts                announcementCategories enum
│   └── lib/constants/announcements.ts  announcementCategoryLabels
└── components/organisms/AnnouncementList.tsx
    ├── lib/constants/announcements.ts  announcementCategoryLabels
    ├── components/atoms/Badge.tsx
    └── lib/actions/announcements.ts    deleteAnnouncement()

app/admin/(console)/announcements/new/page.tsx
app/admin/(console)/announcements/[id]/page.tsx
├── lib/actions/announcements.ts        createAnnouncement() / getAnnouncement(), updateAnnouncement()
└── components/organisms/AnnouncementForm.tsx
    ├── lib/db/schema.ts                announcementCategories enum
    └── lib/constants/announcements.ts  announcementCategoryLabels
```

## 참고

- `getAnnouncements()`(이 화면이 씀, 필터만 하고 전체를 한 번에 읽음)와 `getAnnouncementsPage()`(회원용 `/notices`가 씀, 페이지네이션 있음)는 서로 다른 함수입니다 — 둘 다 정렬에 `isPinned`를 우선 반영하도록 이번 세션에 맞춰졌습니다(원래 `getAnnouncementsPage()`만 이 정렬이 빠져 있던 버그를 수정, [`docs/pages/00-roadmap.md`](../pages/00-roadmap.md) 참고).
- 대시보드(`/admin`)의 "고정 공지" 섹션도 `getAnnouncements()`를 재사용해서 `isPinned`만 다시 필터링합니다.
