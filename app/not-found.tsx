import Image from "next/image";
import Link from "next/link";

// 앱 루트(app/)에 있어서 (user)/admin 라우트 그룹의 Header/Footer는 안 씌워진다
// (route group 레이아웃은 그 그룹 안에서만 적용됨) — 그래서 로고/문구만으로
// 독립적으로 완결된 화면을 구성한다. 존재하지 않는 URL 전체(그룹 안팎 상관없이)
// 와, 코드에서 notFound()를 호출한 경우 전부 이 화면이 뜬다.
export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20 text-center">
      <Image src="/logo.png" alt="리더 길드 로고" width={64} height={64} className="rounded-xl" />
      <div className="space-y-2">
        <p className="text-sm font-semibold tracking-widest text-brand">404</p>
        <h1 className="text-2xl font-semibold text-ink">페이지를 찾을 수 없습니다</h1>
        <p className="text-sm text-ink-muted">
          주소가 잘못됐거나, 이동 혹은 삭제된 페이지예요.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-ink-inverse hover:opacity-90"
      >
        홈으로 이동
      </Link>
    </div>
  );
}
