import Link from "next/link";
import { Suspense } from "react";
import { logout } from "@/app/actions";
import { BottomNav, TopNav } from "@/components/nav";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="mx-auto flex min-h-screen max-w-xl flex-col px-4 pb-28 md:pb-12">
      <header className="flex items-center justify-between gap-3 py-4">
        <Link href="/" className="font-display text-[26px] leading-none text-fucsia">
          CInput
        </Link>
        <Suspense>
          <TopNav />
        </Suspense>
        <form action={logout} className="md:hidden">
          <button className="rounded-full px-2 py-1 text-[13px] font-bold text-ink-soft hover:text-ink">
            Log out
          </button>
        </form>
      </header>
      <main className="flex flex-1 flex-col gap-6">{children}</main>
      <Suspense>
        <BottomNav />
      </Suspense>
    </div>
  );
}
