import type { Metadata } from "next";
import { getAuthState } from "@/lib/auth/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildOrganizationSchema } from "@/lib/seo/json-ld";
import { SITE_URL, SITE_NAME, OG_IMAGE_DEFAULT } from "@/lib/seo/config";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { HScrollSection } from "@/components/home/HScrollSection";
import { NeedFeedbackSection } from "@/components/home/NeedFeedbackSection";
import { ValueSection } from "@/components/home/ValueSection";
import { FooterCta } from "@/components/home/FooterCta";
import type { HomeProduct, NeedFeedbackItem } from "@/types/feed";

const META_TITLE = `${SITE_NAME} · 메이커의 제품에 진짜 피드백, 아이디어는 증명서로 안전하게`;
const META_DESC =
  "만들었는데 아무도 안 써요? 한국 인디 메이커의 진짜 피드백을 받고, 타임스탬프 증명서로 '내가 먼저' 기록을 남기세요. 1인 개발자와 바이브코더를 위한 공간.";

export const metadata: Metadata = {
  title: { absolute: META_TITLE },
  description: META_DESC,
  keywords: [
    "한국 인디 메이커",
    "사이드프로젝트 피드백",
    "아이디어 등록 증명",
    "바이브코딩",
    "1인 개발자 피드백",
    "스타트업 피드백",
    "MVP 피드백",
    "마이프로덕트",
  ],
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: META_TITLE,
    description: META_DESC,
    siteName: SITE_NAME,
    locale: "ko_KR",
    images: [{ url: OG_IMAGE_DEFAULT, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: META_TITLE,
    description: META_DESC,
    images: [OG_IMAGE_DEFAULT],
  },
};

async function fetchHomeData(): Promise<{
  recent: HomeProduct[];
  topFeedback: HomeProduct[];
  needFeedback: NeedFeedbackItem[];
}> {
  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();

    const [recentRes, topRes, needRes] = await Promise.all([
      supabase
        .from("products")
        .select(
          "slug, name, tagline, category, feedback_count, certificates(registration_number)",
        )
        .eq("status", "public")
        .order("created_at", { ascending: false })
        .limit(6),
      supabase
        .from("products")
        .select(
          "slug, name, tagline, category, feedback_count, certificates(registration_number)",
        )
        .eq("status", "public")
        .order("feedback_count", { ascending: false })
        .limit(4),
      supabase
        .from("products")
        .select("slug, name, tagline, feedback_count, created_at")
        .eq("status", "public")
        .lte("feedback_count", 3)
        .order("created_at", { ascending: false })
        .limit(3),
    ]);

    const toHomeProduct = (p: any): HomeProduct => ({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      category: p.category,
      feedbackCount: p.feedback_count,
      hasCertificate: (p.certificates?.length ?? 0) > 0,
      gradientFrom: "#2D5F3F",
      gradientTo: "#3d7a52",
      label: p.name.slice(0, 6),
    });

    const msPerDay = 86_400_000;
    const toNeedFeedback = (p: any): NeedFeedbackItem => ({
      slug: p.slug,
      name: p.name,
      tagline: p.tagline,
      feedbackCount: p.feedback_count,
      daysAgo: Math.floor((Date.now() - new Date(p.created_at).getTime()) / msPerDay),
      gradientFrom: "#D4A574",
      gradientTo: "#b88751",
      label: p.name.slice(0, 6),
    });

    return {
      recent: (recentRes.data ?? []).map(toHomeProduct),
      topFeedback: (topRes.data ?? []).map(toHomeProduct),
      needFeedback: (needRes.data ?? []).map(toNeedFeedback),
    };
  } catch {
    return { recent: [], topFeedback: [], needFeedback: [] };
  }
}

export default async function HomePage() {
  const [{ authUser }, { recent, topFeedback, needFeedback }] = await Promise.all([
    getAuthState(),
    fetchHomeData(),
  ]);
  const isLoggedIn = !!authUser;

  return (
    <>
      <JsonLd schema={buildOrganizationSchema()} />

      <HeroSection isLoggedIn={isLoggedIn} />

      {/* 최근 올라온 제품 — 비어있어도 섹션 표시 (빈 상태 포함) */}
      <CategorySection products={recent} />

      {/* 피드백 많이 받은 — 데이터 있을 때만 표시 */}
      {topFeedback.length > 0 && <HScrollSection products={topFeedback} />}

      {/* 피드백 기다리는 — 데이터 있을 때만 표시 */}
      {needFeedback.length > 0 && <NeedFeedbackSection items={needFeedback} />}

      <ValueSection />
      <FooterCta isLoggedIn={isLoggedIn} />
    </>
  );
}
