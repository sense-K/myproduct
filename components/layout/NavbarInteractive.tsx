"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, X, User, ChevronDown } from "lucide-react";
import type { UserProfile } from "@/lib/auth/server";

type Props = { profile: UserProfile | null };

const NAV_LINKS = [
  { href: "/feed", label: "구경하기" },
  { href: "/registry", label: "레지스트리" },
  { href: "/guide", label: "가이드" },
  { href: "/about", label: "소개" },
];

export function NavbarInteractive({ profile }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSignOut() {
    await fetch("/api/auth/signout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <>
      {/* 데스크톱: 우측 영역 */}
      <div className="hidden items-center gap-6 md:flex">
        {NAV_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="text-sm font-medium text-ink-60 transition-colors hover:text-ink"
          >
            {l.label}
          </Link>
        ))}

        {profile ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-full border border-ink-10 px-3 py-1.5 text-sm font-medium transition-colors hover:border-ink"
              aria-expanded={dropdownOpen}
            >
              {profile.google_profile_image_url ? (
                <img
                  src={profile.google_profile_image_url}
                  alt=""
                  className="h-5 w-5 rounded-full object-cover"
                />
              ) : (
                <User size={16} className="text-ink-60" />
              )}
              <span className="max-w-[80px] truncate">{profile.nickname}</span>
              <ChevronDown size={14} className="text-ink-40" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-40 rounded-[14px] border border-ink-10 bg-paper py-1 shadow-md">
                <Link
                  href="/me"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-ink hover:bg-cream"
                >
                  마이페이지
                </Link>
                <Link
                  href="/me/settings"
                  onClick={() => setDropdownOpen(false)}
                  className="block px-4 py-2 text-sm text-ink hover:bg-cream"
                >
                  설정
                </Link>
                <hr className="my-1 border-ink-10" />
                <button
                  onClick={handleSignOut}
                  className="block w-full px-4 py-2 text-left text-sm text-ink-60 hover:bg-cream"
                >
                  로그아웃
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-[8px] bg-ink px-4 py-1.5 text-sm font-semibold text-cream transition-opacity hover:opacity-90"
          >
            로그인
          </Link>
        )}
      </div>

      {/* 모바일: 햄버거 버튼 */}
      <button
        className="flex items-center justify-center rounded-[8px] p-2 text-ink md:hidden"
        onClick={() => setMobileOpen((v) => !v)}
        aria-label={mobileOpen ? "메뉴 닫기" : "메뉴 열기"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      {/* 모바일 드로어 */}
      {mobileOpen && (
        <div className="absolute left-0 right-0 top-full z-40 border-t border-ink-10 bg-paper shadow-md md:hidden">
          <nav className="flex flex-col py-2">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setMobileOpen(false)}
                className="px-5 py-3 text-sm font-medium text-ink hover:bg-cream"
              >
                {l.label}
              </Link>
            ))}
            <hr className="my-1 border-ink-10" />
            {profile ? (
              <>
                <Link href="/me" onClick={() => setMobileOpen(false)} className="px-5 py-3 text-sm text-ink hover:bg-cream">
                  마이페이지
                </Link>
                <Link href="/me/settings" onClick={() => setMobileOpen(false)} className="px-5 py-3 text-sm text-ink hover:bg-cream">
                  설정
                </Link>
                <button onClick={handleSignOut} className="px-5 py-3 text-left text-sm text-ink-60 hover:bg-cream">
                  로그아웃
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="mx-4 my-2 flex h-11 items-center justify-center rounded-[8px] bg-ink text-sm font-semibold text-cream"
              >
                로그인
              </Link>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
