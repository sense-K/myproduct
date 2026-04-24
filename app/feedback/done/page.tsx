import Link from "next/link";
import { SITE_NAME } from "@/lib/seo/config";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams: Promise<{ product?: string; balance?: string }>;
};

export default async function FeedbackDonePage({ searchParams }: PageProps) {
  const sp = await searchParams;
  const productName = sp.product ? decodeURIComponent(sp.product) : "해당 제품";
  const balance = Number(sp.balance ?? 1);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 py-8 text-center">
      {/* 브랜드 */}
      <p className="mb-8 text-[14px] font-extrabold tracking-tight text-ink-40">
        <span className="mr-1 text-accent">●</span>
        {SITE_NAME}
      </p>

      {/* 등록권 카운터 카드 */}
      <div className="mb-8 flex flex-col items-center gap-3 rounded-[28px] bg-sage-soft px-10 py-6">
        <p className="text-[11px] font-bold uppercase tracking-widest text-sage">등록권 획득</p>
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            {[...Array(balance)].map((_, i) => (
              <div key={i} className="h-4 w-4 rounded-full bg-sage" />
            ))}
          </div>
          <span className="text-[28px] font-extrabold text-[#2c4229]">
            {balance}
          </span>
        </div>
        <p className="text-[12px] font-semibold text-[#3a5237]">
          ✓ 등록권이 {balance}개로 늘었어요
        </p>
      </div>

      {/* 완료 메시지 */}
      <p className="text-5xl" role="img" aria-label="새싹">🌱</p>
      <h1 className="mt-3 text-[22px] font-extrabold tracking-tight">
        좋은 피드백 고마워요
      </h1>
      <p className="mt-2 text-[13px] leading-relaxed text-ink-60">
        <strong className="font-semibold text-ink">"{productName}"</strong> 팀이
        당신의 피드백을 확인하게 돼요.
        <br />
        이제 내 제품을 올릴 수 있어요.
      </p>

      {/* CTA */}
      <div className="mt-8 flex w-full flex-col gap-3">
        {balance >= 1 && (
          <Link
            href="/submit/url"
            className="flex h-[50px] items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
          >
            내 제품 올리러 가기 →
          </Link>
        )}
        <Link
          href="/feedback/pick"
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          한 번 더 피드백 하기
        </Link>
        <Link
          href="/"
          className="text-[12px] font-medium text-ink-40 underline hover:text-ink"
        >
          나중에 하기
        </Link>
      </div>
    </div>
  );
}
