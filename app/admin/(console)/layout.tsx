import { AdminSidebar } from "@/components/organisms/layout/AdminSidebar";

// 관리자 콘솔은 전부 실시간 보호된 데이터(통장 잔액, 길드원 목록 등)라 정적
// prerender 대상이 되면 안 된다 — 실제로 이 설정이 없어서 next build가 페이지를
// 빌드 시점에 미리 그리려다 DB에 접속을 시도했고, 빌드 환경(Vercel)에 DB 연결
// 정보가 없어 "connect ECONNREFUSED 127.0.0.1:5432"로 빌드 자체가 실패했다
// (2026-08-15). 레이아웃에서 강제해두면 하위 /admin/(console)/** 전부에 적용된다.
export const dynamic = "force-dynamic";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1">
      <AdminSidebar />
      {/* min-w-0: flex-1인 채로 두면 기본값(min-width: auto) 때문에 표처럼 폭이
          넓은 콘텐츠가 이 영역 안의 overflow-x-auto로 갇히지 않고 body 전체를
          가로로 밀어버려서, 오른쪽 칼럼(비고 등)이 화면 밖으로 잘려 나가는
          문제가 있었다(2026-08-14, 거래 내역 표) — 이 값으로 표 자체의 스크롤이
          이 영역 안에서 온전히 동작하게 고정한다. */}
      <main className="min-w-0 flex-1 bg-surface/80 px-8 py-6 backdrop-blur-sm">{children}</main>
    </div>
  );
}
