import { SITE_URL, SITE_NAME } from "./config";

// ─── 9.4.1 WebSite (전 페이지 공통) ─────────────────────────────────────────

export function buildWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "ko",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/feed?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  } as const;
}

// ─── 9.4.2 Organization (홈 추가) ────────────────────────────────────────────

export function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    description:
      "한국 인디 메이커를 위한 피드백 교환과 등록 증명 플랫폼",
    contactPoint: {
      "@type": "ContactPoint",
      email: "zzabhm@gmail.com",
      contactType: "customer support",
      availableLanguage: "Korean",
    },
  } as const;
}

// ─── 9.4.3 SoftwareApplication (제품 상세) ───────────────────────────────────

type ProductSchemaInput = {
  name: string;
  tagline: string;
  category: string;
  slug: string;
  thumbnailUrl?: string | null;
  externalUrl?: string | null;
  makerNickname: string;
  createdAt: string;
  updatedAt: string;
};

const CATEGORY_LABEL: Record<string, string> = {
  saas: "WebApplication",
  mobile_app: "MobileApplication",
  webtoon_creative: "Game",
  quirky: "WebApplication",
  etc: "WebApplication",
};

export function buildProductSchema({
  name,
  tagline,
  category,
  slug,
  thumbnailUrl,
  externalUrl,
  makerNickname,
  createdAt,
  updatedAt,
}: ProductSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description: tagline,
    applicationCategory: CATEGORY_LABEL[category] ?? "WebApplication",
    operatingSystem: "Web",
    url: externalUrl || `${SITE_URL}/p/${slug}`,
    image: thumbnailUrl || undefined,
    datePublished: createdAt,
    dateModified: updatedAt,
    author: {
      "@type": "Person",
      name: makerNickname,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "KRW",
    },
  };
}

// ─── 9.4.4 BreadcrumbList (제품·증명서 페이지) ──────────────────────────────

export function buildBreadcrumbSchema(
  items: Array<{ name: string; url: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ─── 9.4.5 FAQPage (/guide) ──────────────────────────────────────────────────

export function buildFAQSchema(
  questions: Array<{ question: string; answer: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: questions.map((q) => ({
      "@type": "Question",
      name: q.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: q.answer,
      },
    })),
  };
}

// ─── 9.4.6 CreativeWork (/registry/[regnum]) ─────────────────────────────────

export function buildCreativeWorkSchema({
  productName,
  tagline,
  makerNickname,
  issuedAt,
  contentHash,
  regnum,
}: {
  productName: string;
  tagline: string;
  makerNickname: string;
  issuedAt: string;
  contentHash: string;
  regnum: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: productName,
    description: tagline,
    creator: {
      "@type": "Person",
      name: makerNickname,
    },
    dateCreated: issuedAt,
    identifier: contentHash,
    url: `${SITE_URL}/registry/${regnum}`,
  };
}

// ─── 9.4.5 Article (/about) ──────────────────────────────────────────────────

export function buildArticleSchema({
  title,
  description,
  url,
  datePublished,
}: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    url,
    datePublished,
    author: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
