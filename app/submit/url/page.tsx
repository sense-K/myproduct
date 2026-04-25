import { redirect } from "next/navigation";
import { getCreditBalance } from "@/lib/submit/actions";
import { UrlForm } from "./url-form";
import { SITE_NAME } from "@/lib/seo/config";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SubmitUrlPage() {
  // AI 자동 채움 일시 비활성화 — 결제 이슈 해결 후 아래 주석 해제하고 이 redirect 제거
  redirect("/submit/manual");

  // eslint-disable-next-line no-unreachable
  const balance = await getCreditBalance();
  if (balance < 1 && process.env.NODE_ENV !== "development") {
    redirect("/submit/intro");
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/submit/intro" className="text-sm font-semibold text-ink-60 hover:text-ink">
          ← 뒤로
        </Link>
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>
          {SITE_NAME}
        </span>
        <div className="w-12" />
      </div>

      {/* 등록권 상태 */}
      <div className="mb-5 flex items-center gap-2 rounded-[8px] bg-sage-soft px-3 py-2">
        <span className="text-[13px] font-bold text-sage">
          ✓ 등록권 {Math.max(balance, 1)}/{Math.max(balance, 1)} 확보
        </span>
      </div>

      {/* 진행률 */}
      <div className="mb-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-ink-10">
          <div className="h-full w-1/5 rounded-full bg-accent transition-all" />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-40">1 / 5단계 · URL 입력</p>
      </div>

      <UrlForm />
    </div>
  );
}
