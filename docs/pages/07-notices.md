# 공지사항 (`/notices`, `/notices/[key]`)

## 목적/기능

리더 공지(자체 DB, `announcements` 테이블) + 공식 포럼 3개 게시판(공지/업데이트/개발자노트, Netmarble 공식 API)을 하나의 피드로 합쳐 검색/무한스크롤로 보여줍니다. `lib/actions/notices.ts`의 `UnifiedNotice` 타입으로 4개 출처를 통일합니다.

- **카테고리 필터**: 전체 / 리더공지 / 포럼공지 / 업데이트 / 개발자노트.
- **"전체" 탭의 페이지네이션 방식**: DB 테이블 하나와 외부 API 3개에 걸친 단일 커서가 없어서, 매 페이지마다 각 출처를 처음부터 더 큰 window로 다시 가져와 날짜순으로 합친 뒤 그 페이지 구간만 잘라냅니다(`getNoticesPage`, `lib/actions/notices.ts` 101~128행 주석 참고) — "더 불러오기"마다 이미 본 항목을 다시 가져오는 비용이 있지만, 이 앱 규모에서는 감수하는 설계입니다.
- **고정 공지 정렬(2026-08-11 버그 수정됨)**: `isPinned=true`인 리더 공지는 카테고리/탭과 무관하게 날짜와 상관없이 항상 최상단에 노출됩니다. 예전에는 `getAnnouncementsPage()`가 `createdAt`으로만 정렬하고, "전체" 탭 병합 정렬도 `date`로만 정렬해 고정 공지가 묻히는 버그가 있었습니다. 지금은 두 곳 모두 `isPinned`를 최우선 정렬 키로 씁니다.
- **고정 공지 시각 구분**: 카드에 "고정" 배지 + `border-brand/60 bg-brand/10` 틴트 배경 + 제목 앞 핀 아이콘(lucide `Pin`)이 함께 적용됩니다(`NoticeFeed.tsx`).
- **24시간 이내 글**: `NewBadge`로 "NEW" 표시.
- 상세 페이지(`/notices/[key]`)는 이전글/다음글 네비게이션 포함. `key`는 `${source}-${id}` 형식(예: `leader-12`, `notice-345`).

## 파일 구성

```
app/(user)/notices/page.tsx
app/(user)/notices/[key]/page.tsx
├── lib/actions/notices.ts              getNoticesPage(), getNoticeDetail()
│   ├── lib/actions/announcements.ts    getAnnouncementsPage(), getAdjacentAnnouncements(), getAnnouncement()
│   ├── lib/actions/officialForum.ts    getOfficialForumPage(), getOfficialForumArticle(), getAdjacentForumArticles()
│   ├── lib/constants/officialForum.ts  OFFICIAL_FORUM_*_MENU_SEQ
│   └── lib/time.ts                     toEpochMs()
│
├── components/organisms/NoticeFeed.tsx  ("use client", 목록/검색/무한스크롤)
│   ├── components/atoms/Input.tsx
│   ├── components/atoms/Badge.tsx
│   ├── components/atoms/SourceLabel.tsx
│   ├── components/atoms/NewBadge.tsx
│   └── lucide-react                    Loader2, Pin
│
└── (상세 페이지 전용)
    ├── components/atoms/SourceLabel.tsx
    ├── components/atoms/Badge.tsx
    └── lucide-react                    ArrowLeft, ArrowRight, ExternalLink
```

## 참고

- 포럼 게시글 본문은 Netmarble CMS가 내려주는 raw HTML을 `dangerouslySetInnerHTML`로 그대로 렌더링합니다(`isHtml: true`). 리더 공지는 일반 텍스트(`whitespace-pre-wrap`).
