import type { Metadata } from "next";
import {
  SITE_NAME,
  SITE_URL,
  SITE_DESCRIPTION,
  OG_IMAGE_DEFAULT,
  TWITTER_HANDLE,
} from "./config";

// ─── 공통 OG/Twitter 기본값 ──────────────────────────────────────────────────

const baseOg = {
  siteName: SITE_NAME,
  locale: "ko_KR",
} as const;

const baseTwitter = {
  card: "summary_large_image" as const,
  site: TWITTER_HANDLE,
};

// ─── 루트 레이아웃 기본 메타데이터 ──────────────────────────────────────────

export const rootMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    // 각 페이지가 title만 지정하면 " | 마이프로덕트" 자동 붙음
    default: `${SITE_NAME} | 한국 인디 메이커 피드백·증명 플랫폼`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "사이드프로젝트",
    "1인 개발자",
    "바이브코딩",
    "인디 메이커",
    "사이드프로젝트 피드백",
    "아이디어 보호",
    "등록 증명서",
    "마이프로덕트",
  ],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  openGraph: {
    ...baseOg,
    type: "website",
    url: SITE_URL,
    title: `${SITE_NAME} | 한국 인디 메이커 피드백·증명 플랫폼`,
    description: SITE_DESCRIPTION,
    images: [{ url: OG_IMAGE_DEFAULT, width: 1200, height: 630, alt: SITE_NAME }],
  },
  twitter: {
    ...baseTwitter,
    title: `${SITE_NAME} | 한국 인디 메이커 피드백·증명 플랫폼`,
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE_DEFAULT],
  },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  alternates: { canonical: SITE_URL },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
};

// ─── 페이지별 메타데이터 빌더 ────────────────────────────────────────────────

type PageMetaInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
};

/** 공통 메타데이터 빌더. 모든 (public) 페이지에서 사용. */
export function buildPageMetadata({
  title,
  description,
  path,
  image = OG_IMAGE_DEFAULT,
  noindex = false,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...baseOg,
      type: "website",
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: { ...baseTwitter, title, description, images: [image] },
    ...(noindex && { robots: { index: false, follow: true } }),
  };
}

type ProductMetaInput = {
  name: string;
  tagline: string;
  slug: string;
  thumbnailUrl?: string | null;
  category: string;
  makerNickname: string;
};

/** 제품 상세 페이지 메타데이터 (PRD 9.3.1 패턴) */
export function buildProductMetadata({
  name,
  tagline,
  slug,
  thumbnailUrl,
  category,
  makerNickname,
}: ProductMetaInput): Metadata {
  const title = `${name} - ${tagline}`;
  const description =
    `${name}: ${tagline}. ${makerNickname} 메이커가 등록한 한국 인디 ${category} 제품. ` +
    `마이프로덕트에서 피드백을 받고 등록 증명서를 발급받았습니다.`;
  const url = `${SITE_URL}/p/${slug}`;
  const image = thumbnailUrl || OG_IMAGE_DEFAULT;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      ...baseOg,
      type: "website",
      url,
      title,
      description,
      images: [{ url: image, width: 1200, height: 630, alt: `${name} 썸네일` }],
    },
    twitter: { ...baseTwitter, title, description, images: [image] },
  };
}

type CertMetaInput = {
  regNum: string;
  productName: string;
  makerNickname: string;
};

/** 증명서 페이지 메타데이터 */
export function buildCertMetadata({ regNum, productName, makerNickname }: CertMetaInput): Metadata {
  const title = `${productName} 등록 증명서 · ${regNum}`;
  const description =
    `${makerNickname} 메이커의 "${productName}" 제품 등록 증명서. ` +
    `마이프로덕트 공개 레지스트리에 타임스탬프·해시와 함께 영구 보존됩니다.`;
  const url = `${SITE_URL}/registry/${regNum}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { ...baseOg, type: "website", url, title, description },
    twitter: { ...baseTwitter, title, description },
  };
}
