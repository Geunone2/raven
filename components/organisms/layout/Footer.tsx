import Link from "next/link";
import { Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-edge/60 bg-surface/50 px-10 py-5 text-center text-xs text-ink-faint backdrop-blur-sm">
      <div className="flex items-center justify-center gap-3">
        <Link href="/terms" className="hover:text-ink hover:underline">
          이용 약관
        </Link>
        <span>ㅣ</span>
        <Link href="/privacy" className="hover:text-ink hover:underline">
          개인정보처리방침
        </Link>
        <span>ㅣ</span>
        <span>고객문의</span>
      </div>
      <div className="mt-2 flex items-center justify-center gap-1.5">
        <Mail className="size-3.5" />
        <span>rmsdnjsaos@gmail.com</span>
      </div>
      <p className="mt-3">
        이 사이트에서 사용된 일부 컨텐츠의 저작권은 넷마블(주)에 있습니다.
      </p>
      <p className="mt-1">© 2026 레이븐2 리더길드. All rights reserved.</p>
    </footer>
  );
}
