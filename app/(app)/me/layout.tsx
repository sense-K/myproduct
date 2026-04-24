import Link from "next/link";
import { headers } from "next/headers";

const NAV_ITEMS = [
  { href: "/me", label: "대시보드" },
  { href: "/me/products", label: "내 제품" },
  { href: "/me/feedbacks-given", label: "준 피드백" },
  { href: "/me/feedbacks-received", label: "받은 피드백" },
  { href: "/me/settings", label: "설정" },
];

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") ?? "";

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
      {/* 탭 네비게이션 */}
      <nav
        className="scrollbar-hide mb-6 flex gap-1 overflow-x-auto"
        aria-label="마이페이지 탭"
      >
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/me"
              ? pathname === "/me" || !pathname
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${
                isActive
                  ? "bg-ink text-cream"
                  : "text-ink-60 hover:text-ink"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>

      {children}
    </div>
  );
}
