import Link from "next/link";
import { getAuthState } from "@/lib/auth/server";
import { NavbarInteractive } from "./NavbarInteractive";

export async function Navbar() {
  const { profile } = await getAuthState();

  return (
    <header className="sticky top-0 z-30 border-b border-ink-10 bg-paper/95 backdrop-blur-sm">
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* 로고 */}
        <Link href="/" className="flex items-center gap-2 text-base font-extrabold tracking-tight text-ink">
          <span className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-ink text-xs font-black text-cream">M</span>
          <span className="hidden sm:inline">마이프로덕트</span>
        </Link>

        {/* 인터랙티브 영역 (데스크톱 메뉴 + 모바일 햄버거) */}
        <NavbarInteractive profile={profile} />
      </div>
    </header>
  );
}
