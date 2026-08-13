"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { GuildMember } from "@/lib/db/schema";
import { logout } from "@/lib/actions/auth";
import { NAV_LINKS } from "@/lib/constants/nav";
import { ThemeToggle } from "@/components/atoms/ThemeToggle";

export function MobileNav({ member }: { member: GuildMember | null }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="xl:hidden">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? "메뉴 닫기" : "메뉴 열기"}
        className="rounded-md p-2 text-ink-muted hover:bg-surface-hover"
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>

      {open && (
        <nav className="absolute inset-x-0 top-full z-20 flex flex-col gap-1 border-b border-edge/60 bg-surface p-4 text-sm text-ink-muted shadow-md">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 hover:bg-surface-hover"
            >
              {link.label}
            </Link>
          ))}
          <div className="flex items-center justify-between gap-2">
            {member ? (
              <form action={logout} className="flex-1">
                <button
                  type="submit"
                  className="w-full rounded-md px-3 py-2 text-left hover:bg-surface-hover"
                >
                  로그아웃 ({member.nickname})
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-md px-3 py-2 hover:bg-surface-hover"
              >
                로그인
              </Link>
            )}
            <ThemeToggle />
          </div>
        </nav>
      )}
    </div>
  );
}
