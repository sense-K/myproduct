import Link from "next/link";
import { getRecommendedProducts } from "@/lib/feedback/actions";
import { getCreditBalance } from "@/lib/submit/actions";
import { SITE_NAME } from "@/lib/seo/config";

export const dynamic = "force-dynamic";

export default async function FeedbackPickPage() {
  const [products, balance] = await Promise.all([
    getRecommendedProducts(),
    getCreditBalance(),
  ]);

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <Link href="/" className="text-sm font-semibold text-ink-60 hover:text-ink">
          ← 홈
        </Link>
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>
          {SITE_NAME}
        </span>
        <div className="w-12" />
      </div>

      {/* 등록권 상태 카드 */}
      <div className="mb-5 flex items-center justify-between rounded-[14px] bg-sage-soft px-4 py-3">
        <div>
          <p className="text-[11px] font-semibold text-sage">등록권 보유</p>
          <p className="text-[18px] font-extrabold text-[#2c4229]">
            {balance}개
          </p>
        </div>
        <div className="flex gap-1.5">
          {[...Array(Math.max(balance, 1))].map((_, i) => (
            <div
              key={i}
              className={`h-3 w-3 rounded-full ${i < balance ? "bg-sage" : "bg-sage/30"}`}
            />
          ))}
        </div>
      </div>

      <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">
        어떤 제품부터 볼까요?
      </h1>
      <p className="mb-6 text-[13px] leading-relaxed text-ink-60">
        아직 피드백이 적어 누군가의 의견을 기다리는 제품들이에요.
        <br />
        <strong className="font-semibold text-ink">
          솔직하게 말해주세요. 다만 부드럽게.
        </strong>
      </p>

      {/* 추천 카드 목록 */}
      {products.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center">
          <p className="text-3xl">🌱</p>
          <p className="text-sm font-semibold">아직 피드백할 제품이 없어요</p>
          <p className="text-xs text-ink-60">곧 새 제품이 올라올 거예요!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {products.map((p) => (
            <div
              key={p.slug}
              className="flex items-center gap-3 rounded-[14px] border border-ink-10 bg-paper p-3"
            >
              {/* 썸네일 */}
              <div
                className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-[8px] text-center text-[10px] font-bold text-white"
                style={{
                  background: `linear-gradient(135deg, ${p.gradientFrom} 0%, ${p.gradientTo} 100%)`,
                }}
              >
                {p.label}
              </div>

              {/* 텍스트 */}
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold">{p.name}</p>
                <p className="truncate text-[11px] text-ink-60">{p.tagline}</p>
                <p className="mt-0.5 text-[10px] font-semibold text-accent">
                  피드백 {p.feedback_count}개 ·{" "}
                  {p.daysAgo === 0
                    ? "오늘"
                    : p.daysAgo === 1
                      ? "어제"
                      : `${p.daysAgo}일 전`}{" "}
                  등록
                </p>
              </div>

              {/* 시작 버튼 */}
              <Link
                href={`/feedback/${p.slug}`}
                className="flex-shrink-0 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-cream transition-opacity hover:opacity-80"
              >
                시작
              </Link>
            </div>
          ))}
        </div>
      )}

      <Link
        href="/feed"
        className="mt-4 block text-center text-[12px] font-semibold text-ink-60 underline hover:text-ink"
      >
        전체 목록에서 직접 고르기 →
      </Link>
    </div>
  );
}
