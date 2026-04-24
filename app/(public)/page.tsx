import type { Metadata } from "next";
import { getAuthState } from "@/lib/auth/server";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildOrganizationSchema } from "@/lib/seo/json-ld";
import { SITE_URL, SITE_NAME, OG_IMAGE_DEFAULT } from "@/lib/seo/config";
import { MOCK_RECENT, MOCK_TOP_FEEDBACK, MOCK_NEED_FEEDBACK } from "@/lib/mock/home";
import { HeroSection } from "@/components/home/HeroSection";
import { CategorySection } from "@/components/home/CategorySection";
import { HScrollSection } from "@/components/home/HScrollSection";
import { NeedFeedbackSection } from "@/components/home/NeedFeedbackSection";
import { ValueSection } from "@/components/home/ValueSection";
import { FooterCta } from "@/components/home/FooterCta";

// PRD 7.1 SEO
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

export default async function HomePage() {
  const { authUser } = await getAuthState();
  const isLoggedIn = !!authUser;

  return (
    <>
      <JsonLd schema={buildOrganizationSchema()} />

      {/* 1. 히어로 */}
      <HeroSection isLoggedIn={isLoggedIn} />

      {/* 2. 최근 올라온 제품 (카테고리 탭 + 그리드) */}
      <CategorySection products={MOCK_RECENT} />

      {/* 3. 이번 주 피드백 많이 받은 (가로 스크롤) */}
      <HScrollSection products={MOCK_TOP_FEEDBACK} />

      {/* 4. 피드백 기다리는 제품 (대시드 보더) */}
      <NeedFeedbackSection items={MOCK_NEED_FEEDBACK} />

      {/* 5. 검정 배경 가치 섹션 */}
      <ValueSection />

      {/* 6. 푸터 CTA */}
      <FooterCta isLoggedIn={isLoggedIn} />
    </>
  );
}
