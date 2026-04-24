import type { Metadata } from "next";
import { getMockFeedPage } from "@/lib/mock/feed";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import { CATEGORIES } from "@/lib/constants/user";
import { FeedFilters } from "./FeedFilters";
import { FeedGrid } from "./FeedGrid";

// ─── 설정 ─────────────────────────────────────────────────────────────────────

// ISR 1시간 — 신규 제품 등록 시 revalidateTag('feed')로 즉시 갱신
export const revalidate = 3600;

const PAGE_SIZE = 12;

// ─── 유틸 ─────────────────────────────────────────────────────────────────────

function normCat(cat: string | undefined): string {
  const valid = ["all", "saas", "mobile_app", "webtoon_creative", "quirky", "etc"];
  return valid.includes(cat ?? "") ? (cat as string) : "all";
}

function normSort(sort: string | undefined): string {
  const valid = ["latest", "feedback", "views"];
  return valid.includes(sort ?? "") ? (sort as string) : "latest";
}

function getCategoryLabel(cat: string): string {
  if (cat === "all") return "전체";
  return CATEGORIES.find((c) => c.value === cat)?.label ?? cat;
}

function buildCanonical(cat: string, page: number): string {
  // PRD 9.3.4: canonical은 sort 파라미터 제외, 카테고리+페이지만
  const params = new URLSearchParams();
  if (cat !== "all") params.set("cat", cat);
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return `${SITE_URL}/feed${q ? `?${q}` : ""}`;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

type SearchParams = Promise<{ cat?: string; sort?: string; page?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const cat = normCat(sp.cat);
  const sort = normSort(sp.sort);
  const page = Math.max(1, Number(sp.page ?? 1));
  const catLabel = getCategoryLabel(cat);

  const title =
    cat === "all"
      ? `한국 인디 제품 피드 · ${SITE_NAME}`
      : `한국 인디 ${catLabel} 제품 모음 · ${SITE_NAME}`;

  const desc =
    cat === "all"
      ? `한국 인디 메이커가 만든 제품을 발견하세요. SaaS, 모바일앱, 웹툰, 창작물까지. 피드백을 남기면 내 제품 등록권이 생겨요.`
      : `한국 인디 메이커가 만든 ${catLabel} 제품 모음. 마이프로덕트에서 직접 써보고 피드백을 남겨보세요.`;

  const canonical = buildCanonical(cat, page);

  // rel=prev/next: 실제 hasMore는 데이터 페치 결과지만 metadata 단계에선 미리 계산
  const { total } = getMockFeedPage({ cat, sort, page });
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const prevUrl = page > 1 ? buildCanonical(cat, page - 1) : undefined;
  const nextUrl = page < totalPages ? buildCanonical(cat, page + 1) : undefined;

  return {
    title: { absolute: title },
    description: desc,
    keywords: [
      `한국 인디 ${catLabel}`,
      "한국 인디 메이커",
      "사이드프로젝트",
      "바이브코딩",
      "1인 개발자 제품",
    ],
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description: desc,
      siteName: SITE_NAME,
      locale: "ko_KR",
    },
    twitter: { card: "summary_large_image", title, description: desc },
    robots: {
      // 정렬 파라미터만 있는 URL은 noindex (중복 콘텐츠 방지)
      index: sort !== "latest" ? false : true,
      follow: true,
    },
    ...(prevUrl || nextUrl
      ? {
          other: {
            ...(prevUrl && { "link-rel-prev": prevUrl }),
            ...(nextUrl && { "link-rel-next": nextUrl }),
          },
        }
      : {}),
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function FeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const cat = normCat(sp.cat);
  const sort = normSort(sp.sort);
  const page = Math.max(1, Number(sp.page ?? 1));

  // SSR 초기 데이터
  let { items, total, hasMore, lastCursor } = getMockFeedPage({ cat, sort, page });

  // DB 연동 시도
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select("slug, name, tagline, category, feedback_count, view_count, created_at, certificates(registration_number)", { count: "exact" })
      .eq("status", "public")
      .limit(PAGE_SIZE);

    if (cat !== "all") query = query.eq("category", cat);

    if (sort === "feedback") query = query.order("feedback_count", { ascending: false });
    else if (sort === "views") query = query.order("view_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, count } = await query;
    if (data && data.length > 0) {
      items = data.map((p: any) => ({
        slug: p.slug,
        name: p.name,
        tagline: p.tagline,
        category: p.category,
        feedback_count: p.feedback_count,
        view_count: p.view_count,
        hasCertificate: (p.certificates?.length ?? 0) > 0,
        gradientFrom: "#2D5F3F",
        gradientTo: "#3d7a52",
        label: p.name.slice(0, 6),
        created_at: p.created_at,
      }));
      total = count ?? 0;
      hasMore = items.length === PAGE_SIZE;
      lastCursor = items.at(-1)?.created_at ?? null;
    }
  } catch {
    // DB 미연동 → mock 유지
  }

  const catLabel = getCategoryLabel(cat);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const canonical = buildCanonical(cat, page);

  return (
    <>
      {/* rel=prev/next (React 19: <link> in RSC는 자동으로 <head>에 삽입됨) */}
      {page > 1 && <link rel="prev" href={buildCanonical(cat, page - 1)} />}
      {page < totalPages && <link rel="next" href={buildCanonical(cat, page + 1)} />}
      <link rel="canonical" href={canonical} />

      <div className="mx-auto max-w-5xl">
        {/* SEO H1 */}
        <div className="px-4 pt-5 sm:px-6">
          <h1 className="text-[22px] font-extrabold tracking-tight">
            {cat === "all" ? "모든 제품" : `${catLabel} 제품`}
          </h1>
          <p className="mt-1 text-[12px] text-ink-60">
            {cat === "all"
              ? "한국 인디 메이커들이 만든 제품을 발견해보세요"
              : `한국 인디 메이커가 만든 ${catLabel} 제품 모음`}
          </p>
        </div>

        {/* 카테고리 탭 + 정렬 */}
        <FeedFilters currentCat={cat} currentSort={sort} total={total} />

        {/* 제품 그리드 + 무한 스크롤 */}
        <FeedGrid
          initialItems={items}
          initialHasMore={hasMore}
          initialCursor={lastCursor}
          cat={cat}
          sort={sort}
        />

        {/* SEO 페이지네이션 링크 (크롤러용, 유저에겐 숨김) */}
        {totalPages > 1 && (
          <nav aria-label="페이지네이션" className="sr-only">
            {page > 1 && (
              <a rel="prev" href={buildCanonical(cat, page - 1)}>
                이전 페이지
              </a>
            )}
            {page < totalPages && (
              <a rel="next" href={buildCanonical(cat, page + 1)}>
                다음 페이지
              </a>
            )}
          </nav>
        )}
      </div>
    </>
  );
}
