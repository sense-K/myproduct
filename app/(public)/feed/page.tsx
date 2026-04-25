import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { SITE_NAME, SITE_URL } from "@/lib/seo/config";
import { CATEGORIES } from "@/lib/constants/user";
import { FeedFilters } from "./FeedFilters";
import { FeedGrid } from "./FeedGrid";
import type { FeedProduct } from "@/types/feed";

export const revalidate = 3600;

const PAGE_SIZE = 12;

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
  const params = new URLSearchParams();
  if (cat !== "all") params.set("cat", cat);
  if (page > 1) params.set("page", String(page));
  const q = params.toString();
  return `${SITE_URL}/feed${q ? `?${q}` : ""}`;
}

type SearchParams = Promise<{ cat?: string; sort?: string; page?: string }>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParams;
}): Promise<Metadata> {
  const sp = await searchParams;
  const cat = normCat(sp.cat);
  const sort = normSort(sp.sort);
  const catLabel = getCategoryLabel(cat);

  const title =
    cat === "all"
      ? `한국 인디 제품 피드 · ${SITE_NAME}`
      : `한국 인디 ${catLabel} 제품 모음 · ${SITE_NAME}`;

  const desc =
    cat === "all"
      ? `한국 인디 메이커가 만든 제품을 발견하세요. SaaS, 모바일앱, 웹툰, 창작물까지. 피드백을 남기면 내 제품 등록권이 생겨요.`
      : `한국 인디 메이커가 만든 ${catLabel} 제품 모음. 마이프로덕트에서 직접 써보고 피드백을 남겨보세요.`;

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
    alternates: { canonical: buildCanonical(cat, 1) },
    openGraph: {
      type: "website",
      url: buildCanonical(cat, 1),
      title,
      description: desc,
      siteName: SITE_NAME,
      locale: "ko_KR",
    },
    twitter: { card: "summary_large_image", title, description: desc },
    robots: {
      index: sort !== "latest" ? false : true,
      follow: true,
    },
  };
}

export default async function FeedPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const cat = normCat(sp.cat);
  const sort = normSort(sp.sort);
  const page = Math.max(1, Number(sp.page ?? 1));

  let items: FeedProduct[] = [];
  let total = 0;
  let hasMore = false;
  let lastCursor: string | null = null;

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    let query = supabase
      .from("products")
      .select(
        "slug, name, tagline, category, feedback_count, view_count, created_at, certificates(registration_number)",
        { count: "exact" },
      )
      .eq("status", "public")
      .limit(PAGE_SIZE);

    if (cat !== "all") query = query.eq("category", cat);

    if (sort === "feedback") query = query.order("feedback_count", { ascending: false });
    else if (sort === "views") query = query.order("view_count", { ascending: false });
    else query = query.order("created_at", { ascending: false });

    const { data, count } = await query;
    if (data) {
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
    // DB 오류 시 빈 상태 표시
  }

  const catLabel = getCategoryLabel(cat);
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const canonical = buildCanonical(cat, page);

  return (
    <>
      {page > 1 && <link rel="prev" href={buildCanonical(cat, page - 1)} />}
      {page < totalPages && <link rel="next" href={buildCanonical(cat, page + 1)} />}
      <link rel="canonical" href={canonical} />

      <div className="mx-auto max-w-7xl">
        <div className="px-4 pt-5 sm:px-6 lg:px-8">
          <h1 className="text-[22px] font-extrabold tracking-tight">
            {cat === "all" ? "모든 제품" : `${catLabel} 제품`}
          </h1>
          <p className="mt-1 text-[12px] text-ink-60">
            {cat === "all"
              ? "한국 인디 메이커들이 만든 제품을 발견해보세요"
              : `한국 인디 메이커가 만든 ${catLabel} 제품 모음`}
          </p>
        </div>

        <FeedFilters currentCat={cat} currentSort={sort} total={total} />

        <FeedGrid
          initialItems={items}
          initialHasMore={hasMore}
          initialCursor={lastCursor}
          cat={cat}
          sort={sort}
        />

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
