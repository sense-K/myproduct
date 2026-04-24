import Link from "next/link";

const LINKS = [
  { href: "/about", label: "소개" },
  { href: "/guide", label: "가이드" },
  { href: "/registry", label: "레지스트리" },
  { href: "/terms", label: "이용약관" },
  { href: "/privacy", label: "개인정보처리방침" },
];

export function Footer() {
  return (
    <footer className="mt-auto border-t border-ink-10 bg-paper">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <nav className="flex flex-wrap gap-x-5 gap-y-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-xs text-ink-60 transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-40">
            © {new Date().getFullYear()} 마이프로덕트. 모든 권리 보유.
          </p>
          <a
            href="mailto:zzabhm@gmail.com"
            className="text-xs text-ink-40 transition-colors hover:text-ink-60"
          >
            문의: zzabhm@gmail.com
          </a>
        </div>
      </div>
    </footer>
  );
}
