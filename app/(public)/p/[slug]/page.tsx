import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";

import { getAuthState } from "@/lib/auth/server";
import { createAdminClient } from "@/lib/supabase/admin";
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

export const dynamic = 'force-dynamic';

type PageProps = { params: Promise<{ slug: string }> };

// ISR: 빌드 시 알려진 슬러그 미리 생성
export async function generateStaticParams() {
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("products")
      .select("slug")
      .eq("status", "public")
      .limit(500);
    return (data ?? []).map((p: { slug: string }) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

// ─── 제품 데이터 패칭 ──────────────────────────────────────────────────────────

async function fetchProduct(slug: string) {
  try {
    const admin = createAdminClient();
    const { data: product } = await admin
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

    return product ?? null;
  } catch {
    return null;
  }
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await fetchProduct(slug);
  if (!product) return { title: "제품을 찾을 수 없어요" };

  const p = product as any;
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
      makerNickname: p.users?.nickname ?? "메이커",
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
  const [raw, { authUser }] = await Promise.all([fetchProduct(slug), getAuthState()]);

  if (!raw) notFound();

  const p = raw as any;

  const product = {
    id: p.id,
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    maker_quote: p.maker_quote,
    category: p.category,
    thumbnail_url: p.thumbnail_url ?? null,
    external_url: p.external_url ?? null,
    view_count: p.view_count ?? 0,
    click_count: p.click_count ?? 0,
    feedback_count: p.feedback_count ?? 0,
    created_at: p.created_at,
    updated_at: p.updated_at,
    status: p.status,
    owner_id: p.owner_id,
    owner_nickname: p.users?.nickname ?? "익명 메이커",
    owner_career_tag: p.users?.career_tag ?? "pre_founder",
    certificate: p.certificates?.[0] ?? null,
    versions: (p.product_versions ?? []).sort(
      (a: any, b: any) => b.version_number - a.version_number,
    ),
    career_distribution: [] as { career_tag: string; label: string; count: number }[],
    related: [] as {
      slug: string;
      name: string;
      tagline: string;
      feedback_count: number;
      hasCertificate: boolean;
      gradientFrom: string;
      gradientTo: string;
      label: string;
    }[],
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
