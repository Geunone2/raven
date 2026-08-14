# 레이븐2 길드 관리 (raven)

게임 **Raven2(레이븐2)** 길드 운영을 위한 웹 애플리케이션입니다. 길드원 관리, 콘텐츠 일정표, 전리품(경매) 분배, 랭킹, 공지사항, 길드 통장(자금), 보스 타이머, 출석 체크까지 길드 운영에 필요한 기능을 한 곳에서 처리합니다.

- **`/` 이하 (회원용)** — 로그인한 길드원이 보는 대시보드 및 각 기능 페이지
- **`/admin` 이하 (운영진용)** — 콘텐츠/데이터를 등록·수정·삭제하는 관리자 콘솔 (별도 관리자 로그인 필요)

이 문서는 처음 이 저장소를 받는 사람(사람이든 AI든)이 5분 안에 "이게 뭐고, 어떻게 켜고, 뭐가 어디 있는지" 파악할 수 있게 하는 게 목적입니다. 더 깊은 내용은 [`docs/`](./docs) 문서를 따라가세요.

---

## ⚠️ 가장 먼저 읽어야 할 것

이 프로젝트의 Next.js(16.2.10)는 흔히 알려진 버전과 **breaking change가 있습니다.** 코드를 작성하기 전에 반드시 [`AGENTS.md`](./AGENTS.md)와 `node_modules/next/dist/docs/`의 관련 가이드를 확인하세요. `CLAUDE.md`는 `AGENTS.md`를 그대로 import합니다.

---

## 사전 요구사항

| 항목 | 버전/비고 |
|---|---|
| Node.js | 20 이상 권장 (`@types/node`가 v20 기준) |
| [pnpm](https://pnpm.io/) | 패키지 매니저 — 이 프로젝트는 `pnpm-lock.yaml`을 기준으로 관리됩니다 |
| SQLite | 별도 설치 불필요 — `better-sqlite3`가 파일 기반으로 동작 |

## 설치 방법

1. **의존성 설치**
   ```bash
   pnpm install
   ```

2. **환경 변수 설정** — 저장소에 값이 커밋되어 있지 않으므로 루트에 `.env.local`을 직접 만들어야 합니다(작업 중인 팀/현재 담당자에게 실제 값을 전달받으세요):
   ```bash
   SESSION_SECRET=      # 길드원 로그인 세션 서명용 임의의 긴 문자열
   ADMIN_EMAIL=         # /admin 로그인 계정 이메일
   ADMIN_PASSWORD=      # /admin 로그인 계정 비밀번호
   ```

3. **DB 마이그레이션 적용**
   ```bash
   pnpm db:migrate
   ```
   `data/raven.db` (gitignore 대상, 로컬 전용)에 SQLite 파일이 생성/갱신됩니다.

4. **개발 서버 실행**
   ```bash
   pnpm dev
   ```
   [http://localhost:3000](http://localhost:3000) 에서 확인합니다. 관리자 콘솔은 `/admin/login`으로 별도 접속합니다.

## 사용 예시

```bash
pnpm dev            # 개발 서버 (Turbopack)
pnpm build           # 프로덕션 빌드
pnpm start            # 빌드 결과 실행
pnpm lint             # ESLint
pnpm db:generate       # 스키마(lib/db/schema.ts) 변경 후 마이그레이션 파일 생성
pnpm db:migrate         # 생성된 마이그레이션을 DB에 적용
```

일반적인 작업 흐름:

- **길드원**: `/signup`으로 가입 → `/login` → 대시보드에서 일정 확인·출석 체크·랭킹·통장 확인
- **운영진**: `/admin/login`으로 로그인 → 길드원/일정/전리품/보스타이머/공지사항 등록·관리, 통장 정산 처리

## 기술 스택

- **프레임워크**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript
- **스타일**: Tailwind CSS 4 (시맨틱 디자인 토큰, 다크모드 지원)
- **DB**: SQLite (`better-sqlite3`) + Drizzle ORM
- **주요 라이브러리**: Tiptap(리치 텍스트 에디터), Recharts(통계 차트), Embla Carousel, react-day-picker, xlsx(엑셀 내보내기)

## 프로젝트 구조

```
app/
  (user)/          # 회원용 페이지 (대시보드, 랭킹, 통장, 일정 등)
  admin/(console)/  # 운영진 콘솔
components/
  atoms/           # 진짜 범용 UI 조각 (Button, Input, Badge 등)
  molecules/        # 두 개 이상 도메인이 공유하는 조합형 컴포넌트 (FormField, Tabs, PaginationControls 등)
  organisms/{domain}/  # 기능(도메인)별 폴더 — loot, treasury, schedule, member,
                        # ranking, boss-timer, announcement, community, layout
lib/
  actions/{domain}/   # 서버 액션, components/organisms와 동일한 도메인 경계
  constants/{domain}/  # 라벨/톤 맵 등 상수, 동일한 도메인 경계
  db/               # Drizzle 스키마 + 마이그레이션
  auth/, hooks/, time.ts, excel.ts 등  # 도메인 무관 공용 유틸
docs/               # 상세 문서 (아래 참고)
```

`components`/`lib` 모두 **기능(도메인)별 폴더 구조**를 따릅니다 — 특정 도메인 하나에서만 쓰이는 파일은 크기와 상관없이 그 도메인 폴더 안에 둡니다(순수하게 범용인 것만 최상위 `atoms`/`lib` 루트에 남습니다).

## 문제 해결

| 증상 | 원인/해결 |
|---|---|
| `pnpm dev` 실행 후 로그인/관리자 로그인이 실패함 | `.env.local`의 `SESSION_SECRET`/`ADMIN_EMAIL`/`ADMIN_PASSWORD`가 비어있거나 잘못됨 |
| DB 관련 에러 (`no such table` 등) | `pnpm db:migrate`를 아직 안 돌렸거나, `lib/db/schema.ts`를 바꾼 뒤 `pnpm db:generate`로 마이그레이션 파일을 새로 만들지 않음 |
| 타입 에러가 낯선 Next.js API에서 발생 | 이 프로젝트의 Next.js는 breaking change가 있음 — `node_modules/next/dist/docs/`에서 해당 API 문서를 먼저 확인 |
| 임포트 경로를 못 찾겠음 | `components`/`lib`는 도메인 폴더로 재구성되어 있음 — 위 "프로젝트 구조" 참고, 또는 파일명으로 검색 |

자동화 테스트는 아직 없습니다(`pnpm lint` + `tsc --noEmit` + 실제 로그인 세션으로 서버 액션을 직접 호출해 확인하는 수동 검증 방식). 자세한 검증 워크플로우는 [`docs/handoff.md`](./docs/handoff.md) 6장을 참고하세요.

## 변경 로그

별도 `CHANGELOG.md`는 아직 없고, 각 기능/리팩토링 단위로 커밋과 PR을 나눠 관리하고 있습니다 — `git log`와 GitHub PR 목록이 사실상의 변경 이력입니다. 최근 주요 변경:

- 코드 리팩토링: `components`/`lib`를 기능별 폴더 구조로 재구성, 중복 코드 정리
- 통장/정산 기능 개편: 정산 비율 관리자 설정, 콘텐츠 보상 정산 2단계 흐름, 탭 UI 재구성
- 공지사항: Tiptap 리치 텍스트 에디터 도입, 필터/정렬 추가
- 대시보드/관리자 테이블 반응형 대응

## 추가 학습 자료

- [`docs/handoff.md`](./docs/handoff.md) — 개발 인수인계 문서: 아키텍처 관례, DB 스키마, 검증 워크플로우
- [`docs/pages/README.md`](./docs/pages/README.md) — 회원용 페이지(`app/(user)/**`) 별 상세 문서 + [로드맵](./docs/pages/00-roadmap.md)
- [`docs/admin/README.md`](./docs/admin/README.md) — 관리자 콘솔(`app/admin/**`) 문서
- [Next.js 공식 문서](https://nextjs.org/docs) / [Drizzle ORM 문서](https://orm.drizzle.team/) / [Tailwind CSS 문서](https://tailwindcss.com/docs)

## 지원 창구

이슈나 질문은 [GitHub Issues](https://github.com/Geunone2/raven/issues)로 남기거나 저장소 관리자(Geunwon Park)에게 직접 문의하세요.

## 라이선스

비공개 프로젝트입니다(`package.json`의 `private: true`). 별도 라이선스가 명시되어 있지 않으며, 무단 사용·배포를 금지합니다.
