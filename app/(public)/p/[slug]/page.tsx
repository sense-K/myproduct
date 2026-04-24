import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getAuthState } from "@/lib/auth/server";
import { getMockProduct, getAllMockSlugs } from "@/lib/mock/products";
import { buildProductMetadata } from "@/lib/seo/metadata";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildProductSchema, buildBreadcrumbSchema } from "@/lib/seo/json-ld";
import { SITE_URL, SITE_NAME } from "@/lib/seo/config";
import { CATEGORIES } from "@/lib/constants/user";

import { ViewTracker } from "@/components/product/ViewTracker";
import { ShareButton } from "@/components/product/ShareButton";
import { ProductHero } from "@/components/product/ProductHero";
import { ProductStats } from "@/components/product/ProductStats";
import { MakerQuote } from "@/components/product/MakerQuote";
import { Timeline } from "@/components/product/Timeline";
import { FeedbackSummary } from "@/components/product/FeedbackSummary";
import { CertCard } from "@/components/product/CertCard";
import { RelatedProducts } from "@/components/product/RelatedProducts";
import { StickyCta } from "@/components/product/StickyCta";

// PRD 9.7.4 — ISR 1시간. 제품 수정 시 revalidateTag('product-{slug}')로 즉시 갱신.
export const revalidate = 3600;

type PageProps = { params: Promise<{ slug: string }> };

// ISR: 빌드 시 알려진 슬러그 미리 생성
export async function generateStaticParams() {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data } = await supabase
      .from("products")
      .select("slug")
      .eq("status", "public")
      .limit(500);
    if (data && data.length > 0) return data.map((p) => ({ slug: p.slug }));
  } catch {
    // DB 없으면 mock slug 반환
  }
  return getAllMockSlugs().map((slug) => ({ slug }));
}

// ─── 제품 데이터 패칭 ──────────────────────────────────────────────────────────

async function fetchProduct(slug: string) {
  // 1) DB 시도
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const { data: product } = await supabase
      .from("products")
      .select(`
        id, slug, name, tagline, maker_quote, category,
        thumbnail_url, external_url, view_count, click_count,
        feedback_count, created_at, updated_at, status, owner_id,
        users!inner ( nickname, career_tag ),
        product_versions ( id, version_label, change_note, version_number, is_initial, created_at ),
        certificates ( registration_number, content_hash, issued_at )
      `)
      .eq("slug", slug)
      .eq("status", "public")
      .maybeSingle();

    if (product) return { source: "db" as const, data: product };
  } catch {
    // DB 오류 → mock 폴백
  }

  // 2) Mock 폴백 (개발 환경)
  const mock = getMockProduct(slug);
  if (mock) return { source: "mock" as const, data: mock };

  return null;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await fetchProduct(slug);
  if (!result) return { title: "제품을 찾을 수 없어요" };

  const p = result.data as any;
  const name = p.name;
  const tagline = (p.tagline as string).slice(0, 80);
  const regDate = new Date(p.created_at).toLocaleDateString("ko-KR");
  const fbCount = p.feedback_count ?? 0;

  const ogImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/og/product?slug=${slug}`;

  return {
    ...buildProductMetadata({
      name,
      tagline,
      slug,
      thumbnailUrl: p.thumbnail_url ?? ogImageUrl,
      category: p.category,
      makerNickname: p.owner_nickname ?? p.users?.nickname ?? "메이커",
    }),
    description: `${tagline} | ${regDate} 등록 · 메이커 ${fbCount}명의 피드백`,
    openGraph: {
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImageUrl],
    },
  };
}

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const [result, { authUser }] = await Promise.all([fetchProduct(slug), getAuthState()]);

  if (!result) notFound();

  // DB row와 mock 모두 동일한 인터페이스로 정규화
  const raw = result.data as any;
  const isMock = result.source === "mock";

  const product = {
    id: raw.id,
    slug: raw.slug,
    name: raw.name,
    tagline: raw.tagline,
    maker_quote: raw.maker_quote,
    category: raw.category,
    thumbnail_url: raw.thumbnail_url ?? null,
    external_url: raw.external_url ?? null,
    view_count: raw.view_count ?? 0,
    click_count: raw.click_count ?? 0,
    feedback_count: raw.feedback_count ?? 0,
    created_at: raw.created_at,
    updated_at: raw.updated_at,
    status: raw.status,
    owner_id: raw.owner_id,
    owner_nickname: isMock ? raw.owner_nickname : (raw.users?.nickname ?? "익명 메이커"),
    owner_career_tag: isMock ? raw.owner_career_tag : (raw.users?.career_tag ?? "pre_founder"),
    certificate: isMock
      ? raw.certificate
      : raw.certificates?.[0] ?? null,
    versions: isMock
      ? raw.versions
      : (raw.product_versions ?? []).sort((a: any, b: any) => b.version_number - a.version_number),
    career_distribution: isMock ? raw.career_distribution : [],
    related: isMock ? raw.related : [],
  };

  const isOwner = !!authUser && authUser.id === product.owner_id;
  const pageUrl = `${SITE_URL}/p/${slug}`;
  const categoryLabel = getCategoryLabel(product.category);

  // 본문 글자 수 600자 확보를 위한 텍스트 집계
  const bodyText = [
    product.tagline,
    product.maker_quote,
    ...product.versions.map((v: any) => `${v.version_label} ${v.change_note ?? ""}`),
  ]
    .filter(Boolean)
    .join(" ");

  const productSchema = buildProductSchema({
    name: product.name,
    tagline: product.tagline,
    category: product.category,
    slug: product.slug,
    thumbnailUrl: product.thumbnail_url,
    externalUrl: product.external_url,
    makerNickname: product.owner_nickname,
    createdAt: product.created_at,
    updatedAt: product.updated_at,
  });

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: "홈", url: SITE_URL },
    { name: categoryLabel, url: `${SITE_URL}/feed?cat=${product.category}` },
    { name: product.name, url: pageUrl },
  ]);

  return (
    <>
      <ViewTracker productId={product.id} slug={slug} />
      <JsonLd schema={productSchema} />
      <JsonLd schema={breadcrumbSchema} />

      {/* 슬림 네비 */}
      <nav className="flex items-center gap-2 border-b border-ink-10 bg-cream/95 px-3 py-2.5 backdrop-blur-sm sm:px-5">
        <Link
          href="/feed"
          className="flex h-9 w-9 items-center justify-center rounded-[8px] text-lg text-ink transition-colors hover:bg-ink-10"
          aria-label="뒤로가기"
        >
          ←
        </Link>
        <Link href="/" className="flex-1 text-center text-[15px] font-extrabold tracking-tight">
          <span className="mr-1.5 text-accent">●</span>
          {SITE_NAME}
        </Link>
        <div className="flex items-center gap-2">
          {isOwner && (
            <Link
              href={`/me/products/${slug}/edit`}
              className="text-[11px] font-semibold text-ink-60 hover:text-ink"
              aria-label="제품 관리"
            >
              관리
            </Link>
          )}
          <ShareButton title={product.name} url={pageUrl} />
        </div>
      </nav>

      {/* 숨김 SEO 본문 (600자 보장) */}
      {bodyText.length < 600 && (
        <p className="sr-only">
          {product.name}은(는) {product.tagline} 마이프로덕트에 등록된 한국 인디 {categoryLabel}{" "}
          제품으로, {product.feedback_count}명의 메이커가 피드백을 남겼습니다.
          {product.certificate &&
            ` ${new Date(product.certificate.issued_at).toLocaleDateString("ko-KR")}에 등록 증명서가 발급되었습니다.`}
        </p>
      )}

      {/* 1. 히어로 */}
      <ProductHero product={product} isOwner={isOwner} />

      {/* 2. 통계 바 */}
      <ProductStats
        viewCount={product.view_count}
        feedbackCount={product.feedback_count}
        clickCount={product.click_count}
        isOwner={isOwner}
      />

      {/* 3. 만든 사람 한마디 */}
      {product.maker_quote && (
        <MakerQuote
          quote={product.maker_quote}
          nickname={product.owner_nickname}
          careerTag={product.owner_career_tag}
        />
      )}

      {/* 4. 성장 타임라인 */}
      {product.versions.length > 0 && (
        <Timeline
          versions={product.versions}
          productSlug={slug}
          isOwner={isOwner}
        />
      )}

      {/* 5. 피드백 요약 */}
      <FeedbackSummary
        feedbackCount={product.feedback_count}
        careerDistribution={product.career_distribution}
        productSlug={slug}
        isOwner={isOwner}
      />

      {/* 6. 등록 증명 카드 */}
      {product.certificate && (
        <CertCard
          certificate={product.certificate}
          productName={product.name}
          nickname={product.owner_nickname}
        />
      )}

      {/* 7. 관련 제품 (내부 링크 SEO) */}
      <RelatedProducts products={product.related} category={product.category} />

      {/* 8. Sticky CTA */}
      <StickyCta
        productSlug={slug}
        isOwner={isOwner}
        feedbackCount={product.feedback_count}
      />
    </>
  );
}
