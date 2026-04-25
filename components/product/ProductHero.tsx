import Link from "next/link";
import { ExternalLinkButton } from "./ExternalLinkButton";
import { CATEGORIES, CAREER_TAGS } from "@/lib/constants/user";
import type { ProductPageData } from "@/types/product";

type Props = {
  product: ProductPageData;
  isOwner: boolean;
};

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

function getCareerLabel(value: string) {
  return CAREER_TAGS.find((t) => t.value === value)?.label ?? value;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getDisplayUrl(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

export function ProductHero({ product, isOwner }: Props) {
  const {
    id,
    name,
    tagline,
    category,
    thumbnail_url,
    external_url,
    feedback_count,
    certificate,
    owner_career_tag,
  } = product;

  const displayUrl = external_url ? getDisplayUrl(external_url) : null;
  const certDate = certificate ? formatDate(certificate.issued_at) : null;

  return (
    <section className="bg-paper pb-5 pt-5">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
      {/* 썸네일 */}
      <div
        className="relative mb-4 flex aspect-video w-full items-center justify-center overflow-hidden rounded-[14px] bg-gradient-to-br from-[#2D5F3F] to-[#3d7a52] text-xl font-extrabold text-white"
        style={
          thumbnail_url
            ? { backgroundImage: `url(${thumbnail_url})`, backgroundSize: "cover" }
            : undefined
        }
        role="img"
        aria-label={`${name} 썸네일`}
      >
        <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-0.5 text-[10px] font-bold text-ink">
          {getCategoryLabel(category)}
        </span>
        {!thumbnail_url && displayUrl}
      </div>

      {/* 제목·태그라인 */}
      <h1 className="text-[24px] font-extrabold leading-tight tracking-tight">{name}</h1>
      <p className="mt-1.5 text-[14px] leading-relaxed text-ink-60">{tagline}</p>

      {/* 핵심 가치 배지 2개 */}
      <div className="mt-4 flex gap-2">
        {certificate ? (
          <div className="flex flex-1 items-center gap-2 rounded-[8px] bg-sage-soft px-3 py-2.5">
            <span className="text-base" aria-hidden="true">🛡️</span>
            <span>
              <strong className="block text-[13px] font-extrabold text-sage">등록 증명</strong>
              <span className="text-[11px] text-sage">{certDate}</span>
            </span>
          </div>
        ) : (
          <div className="flex flex-1 items-center gap-2 rounded-[8px] bg-ink-10 px-3 py-2.5">
            <span className="text-base" aria-hidden="true">🛡️</span>
            <span>
              <strong className="block text-[13px] font-bold text-ink-60">증명서 없음</strong>
            </span>
          </div>
        )}
        <div className="flex flex-1 items-center gap-2 rounded-[8px] bg-accent-soft px-3 py-2.5">
          <span className="text-base" aria-hidden="true">💬</span>
          <span>
            <strong className="block text-[13px] font-extrabold text-accent">
              피드백 {feedback_count}
            </strong>
            <span className="text-[11px] text-accent">
              {getCareerLabel(owner_career_tag)} 메이커
            </span>
          </span>
        </div>
      </div>

      {/* CTA 버튼들 */}
      <div className="mt-4 flex flex-col gap-2.5">
        {external_url ? (
          <ExternalLinkButton
            productId={id}
            externalUrl={external_url}
            displayUrl={displayUrl ?? external_url}
          />
        ) : (
          <div className="flex h-[50px] items-center justify-center rounded-[14px] border border-ink-10 text-sm text-ink-40">
            외부 링크 없음
          </div>
        )}

        {isOwner ? (
          <Link
            href={`/me/feedbacks-received?product=${product.slug}`}
            className="flex h-[44px] items-center justify-center gap-2 rounded-[14px] border border-ink-10 text-[13px] font-bold text-ink transition-colors hover:border-ink"
          >
            💬 피드백 {feedback_count}건 전체 읽기
          </Link>
        ) : (
          <Link
            href={`/feedback/${product.slug}`}
            className="flex h-[44px] items-center justify-center gap-2 rounded-[14px] border border-ink-10 text-[13px] font-bold text-ink transition-colors hover:border-ink"
          >
            💬 이 제품에 피드백 주기
          </Link>
        )}
      </div>
      </div>
    </section>
  );
}
