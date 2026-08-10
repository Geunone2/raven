import Link from "next/link";
import { adminLogout } from "@/lib/actions/adminAuth";

const navItems = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/members", label: "길드원 관리" },
  { href: "/admin/schedules", label: "콘텐츠 일정표" },
  { href: "/admin/loots", label: "보상 분배" },
  { href: "/admin/boss-timers", label: "보스 타이머" },
  { href: "/admin/bank", label: "통장 관리" },
  { href: "/admin/announcements", label: "공지사항" },
];

export function AdminSidebar() {
  return (
    <nav className="flex w-56 shrink-0 flex-col border-r border-edge bg-surface-raised/60 px-4 py-6">
      <p className="mb-4 px-2 text-sm font-semibold tracking-wide text-brand">
        레이븐2 길드 운영
      </p>
      <ul className="space-y-1">
        {navItems.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="block rounded-md px-2 py-1.5 text-sm text-ink-muted hover:bg-surface-hover hover:text-ink"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
      <form action={adminLogout} className="mt-auto pt-6">
        <button
          type="submit"
          className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-ink-muted hover:bg-surface-hover hover:text-ink"
        >
          로그아웃
        </button>
      </form>
    </nav>
  );
}
