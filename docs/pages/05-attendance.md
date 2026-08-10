# 출석 체크 (`/attendance`)

로그인 필수(`redirect("/login")`).

## 목적/기능

진행 중인 콘텐츠 일정에 대해 회원이 직접 출석 상태를 등록하는 셀프서비스 페이지. 일정 시작 후 6시간까지만 응답 가능합니다.

- **출석 점수 안내 카드**(`AttendanceScoreGuideCard`): 보스 등급별 점수(2성=1점, 3성/4성=3점, 어비스보스=6점), 전투 시간당 3점, 중간합류는 절반 점수라는 고정 안내 카드(순수 정적 콘텐츠, 서버 데이터 의존 없음).
- **내 기여도 카드**(`MyContributionCard`): 현재 2주 구간(`getCurrentBiweekRange()`, 2024-01-01 앵커 기준 14일 주기) 동안의 내 기여 점수/전체 대비 비율을 보여줍니다.
- **체크인 패널**(`AttendanceCheckinPanel`): 일정별 출석하기/중간합류/출석취소 3버튼 + 해당 일정의 응답자 명단(roster).

이 페이지가 쓰는 것은 `content_schedules` + `schedule_checkins` 테이블 기반의 **콘텐츠 일정 체크인**입니다(`lib/actions/scheduleCheckins.ts`). 홈 대시보드의 출석체크 카드도 동일 시스템을 씁니다.

**(정리됨) 구 출석 시스템**: `attendance_events` / `attendance_records` 테이블과 `lib/actions/attendance.ts`는 완전히 별개의, 더 오래된 시스템이었습니다. 예전 회원 셀프서비스 체크인 플로우(구 `/checkin`)가 삭제된 이후로는 이 테이블에 쓰는 코드가 전혀 없어 `/admin/attendance` 콘솔이 항상 빈 출석자 명단만 보여주는 죽은 화면이었고, 이를 확인한 뒤 `/admin/attendance` 페이지·`lib/actions/attendance.ts`·관련 컴포넌트(`AttendanceEventTable`/`AttendanceEventForm`/`AttendanceRecordList`)를 전부 삭제하고 사이드바 메뉴도 제거했습니다. DB 테이블 자체는 additive-only 마이그레이션 관례상 드롭하지 않고 `lib/db/schema.ts`에 선언만 남아있습니다(기존 데이터 보존용, 애플리케이션 코드에서는 더 이상 참조하지 않음).

## 파일 구성

```
app/(user)/attendance/page.tsx
├── lib/actions/members.ts              getMember()
├── lib/actions/schedules.ts            getSchedulesForCheckin()
├── lib/actions/scheduleCheckins.ts     getContributionStats(), getMyScheduleCheckins(), getScheduleCheckinRoster()
├── lib/auth/session.ts                 getSessionMemberId()
│
├── components/organisms/AttendanceScoreGuideCard.tsx   (정적, 외부 의존 없음)
├── components/organisms/MyContributionCard.tsx
│   └── lib/actions/scheduleCheckins.ts  ContributionStats 타입
└── components/organisms/AttendanceCheckinPanel.tsx      ("use client")
    ├── lib/constants/schedules.ts      SERVERS
    ├── lib/colorHash.ts                hashTone()
    ├── components/atoms/Badge.tsx
    └── components/organisms/ScheduleCheckinList.tsx
        ├── lib/constants/members.ts    getGuildServer()
        ├── components/atoms/ScheduleCheckinButtons.tsx
        │   ├── lib/db/schema.ts        attendanceStatuses enum
        │   ├── lib/constants/attendance.ts  attendanceStatusLabels
        │   ├── lib/actions/scheduleCheckins.ts  setMyScheduleCheckin()
        │   ├── lib/hooks/useClickDebounce.ts
        │   └── components/atoms/ToastProvider.tsx
        └── components/atoms/ScheduleCheckinRoster.tsx
```

## 참고

- 기여 점수 계산 로직(`getScheduleBasePoints` + `getCheckinPoints`, 체크인=100%/중간합류=50%)은 `lib/actions/scheduleCheckins.ts`와 `lib/constants/schedules.ts`에 나뉘어 있으며, 통장 페이지의 정산 계산기([08-bank.md](./08-bank.md))에서도 동일한 함수를 재사용합니다 — 점수 공식을 바꿀 때는 두 기능이 함께 영향받는다는 점을 기억하세요.
