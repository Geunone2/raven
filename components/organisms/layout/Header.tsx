import Image from "next/image";
import Link from "next/link";
import { GuildMember } from "@/lib/db/schema";
import { logout } from "@/lib/actions/auth";
import { NAV_LINKS } from "@/lib/constants/nav";
import { MobileNav } from "@/components/organisms/layout/MobileNav";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";

export function Header({ member }: { member: GuildMember | null }) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-edge/60 bg-surface/50 px-10 py-5 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-1.5">
        <Image src="/logo.png" alt="리더 길드 로고" width={40} height={40} className="rounded-md" />
        <span className="text-xl font-semibold tracking-wide text-brand">
          리더 길드
        </span>
      </Link>
      <nav className="hidden items-center gap-6 text-sm text-ink-muted lg:flex">
        {NAV_LINKS.map((link) => (
          <Link key={link.href} href={link.href} className="hover:underline">
            {link.label}
          </Link>
        ))}
        {member ? (
          <form action={logout}>
            <button type="submit" className="hover:underline">
              로그아웃 ({member.nickname})
            </button>
          </form>
        ) : (
          <Link href="/login" className="hover:underline">
            로그인
          </Link>
        )}
        <ThemeToggle />
      </nav>
      <MobileNav member={member} />
    </header>
  );
}
