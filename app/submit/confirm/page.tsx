import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/config";
import { ConfirmForm } from "./confirm-form";

export default function SubmitConfirmPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/submit/url" className="text-sm font-semibold text-ink-60 hover:text-ink">
          ← 뒤로
        </Link>
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>
          {SITE_NAME}
        </span>
        <div className="w-12" />
      </div>

      {/* 진행률 */}
      <div className="mb-6">
        <div className="h-1 w-full overflow-hidden rounded-full bg-ink-10">
          <div className="h-full w-4/5 rounded-full bg-accent transition-all" />
        </div>
        <p className="mt-1.5 text-[11px] text-ink-40">4 / 5단계 · 확인 및 수정</p>
      </div>

      <ConfirmForm />
    </div>
  );
}
