import Link from "next/link";
import { logout } from "@/app/actions";

const NAV = [
  { href: "/", label: "Days", short: "Days" },
  { href: "/phrases", label: "Phrases", short: "Phrases" },
  { href: "/review", label: "Weekly check", short: "Week" },
  { href: "/guide", label: "How it works", short: "How to" },
  { href: "/settings", label: "Settings", short: "Settings" },
] as const;

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-screen max-w-2xl flex-col px-4 pb-24 sm:pb-10">
      <header className="flex items-center justify-between py-5">
        <Link href="/" className="text-2xl font-extrabold tracking-tight">
          CInput
        </Link>
        <nav className="hidden gap-1 sm:flex" aria-label="Main">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="rounded-full px-3 py-1.5 font-medium hover:bg-white">
              {n.label}
            </Link>
          ))}
        </nav>
        <form action={logout}>
          <button className="text-sm text-ink-soft hover:text-ink">Log out</button>
        </form>
      </header>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 grid grid-cols-5 border-t-2 border-line bg-white sm:hidden"
      >
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className="py-3 text-center text-sm font-semibold">
            {n.short}
          </Link>
        ))}
      </nav>
    </div>
  );
}
