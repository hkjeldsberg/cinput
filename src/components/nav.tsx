"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const NAV = [
  { href: "/", label: "Days", short: "Days" },
  { href: "/phrases", label: "Phrases", short: "Phrases" },
  { href: "/review", label: "Weekly check", short: "Week" },
  { href: "/guide", label: "How it works", short: "How to" },
  { href: "/settings", label: "Settings", short: "Settings" },
] as const;

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return href === "/" ? pathname === "/" || pathname.startsWith("/day/") : pathname.startsWith(href);
}

const pill = "rounded-full font-bold transition-colors";
const on = "bg-fucsia text-on-fucsia";
const off = "text-ink hover:bg-papel";

export function TopNav() {
  const pathname = usePathname();
  return (
    <nav className="hidden gap-0.5 md:flex" aria-label="Main">
      {NAV.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`${pill} px-2.5 py-1.5 text-[15px] ${active ? on : off}`}
          >
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 gap-1 border-t-2 border-papel bg-card px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] md:hidden"
    >
      {NAV.map((n) => {
        const active = isActive(pathname, n.href);
        return (
          <Link
            key={n.href}
            href={n.href}
            aria-current={active ? "page" : undefined}
            className={`${pill} py-2.5 text-center text-[13px] ${active ? on : off}`}
          >
            {n.short}
          </Link>
        );
      })}
    </nav>
  );
}
