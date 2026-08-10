# 콘텐츠 일정표 (`/schedule`)

## 목적/기능

전체 콘텐츠 일정(`content_schedules`)을 카드형 목록 또는 달력형, 두 가지 뷰로 전환하며 볼 수 있는 페이지(`ScheduleViewToggle`). 서버(`SERVERS` 상수) 필터가 있으며, 배지 색상은 콘텐츠 종류별 고정 토큰 + 서버명은 `hashTone()`으로 부여합니다.

이 페이지 자체는 셀프 체크인 기능이 없는 **조회 전용** 페이지입니다 — 체크인은 `/attendance`([05-attendance.md](./05-attendance.md))에서, 홈 대시보드에는 당월 미니 캘린더(`ScheduleCalendar`)가 별도로 있습니다.

## 파일 구성

```
app/(user)/schedule/page.tsx
├── lib/actions/schedules.ts            getSchedules()
└── components/organisms/ScheduleViewToggle.tsx  ("use client")
    ├── lib/constants/schedules.ts      SERVERS
    ├── lib/colorHash.ts                hashTone()
    ├── components/atoms/Button.tsx, Badge.tsx
    ├── components/organisms/ScheduleCardList.tsx     카드형 뷰
    └── components/organisms/ScheduleCalendarView.tsx  달력형 뷰
        ├── react-day-picker
        └── components/atoms/CalendarDropdown.tsx
```

## 참고

- 홈 대시보드의 `ScheduleCalendar.tsx`(`app/(user)/page.tsx`에서 사용)와 이 페이지의 `ScheduleCalendarView.tsx`는 이름은 비슷하지만 **서로 다른 컴포넌트**입니다 — 전자는 체크인 상태까지 표시하는 대시보드 전용 미니 캘린더, 후자는 이 페이지의 전체 일정 달력 뷰입니다. 리팩토링 시 통합 여지가 있는지 확인해볼 만한 지점입니다.
