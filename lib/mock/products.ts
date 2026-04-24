// 제품 상세 목 데이터. DB 연동 후 제거.

export type VersionItem = {
  id: string;
  version_label: string;
  change_note: string | null;
  version_number: number;
  is_initial: boolean;
  created_at: string;
  is_future?: boolean;
};

export type CareerDist = {
  career_tag: string;
  label: string;
  count: number;
};

export type RelatedProduct = {
  slug: string;
  name: string;
  tagline: string;
  feedback_count: number;
  hasCertificate: boolean;
  gradientFrom: string;
  gradientTo: string;
  label: string;
};

export type ProductPageData = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  maker_quote: string | null;
  category: string;
  thumbnail_url: string | null;
  external_url: string | null;
  view_count: number;
  click_count: number;
  feedback_count: number;
  created_at: string;
  updated_at: string;
  status: string;
  owner_id: string;
  owner_nickname: string;
  owner_career_tag: string;
  certificate: { registration_number: string; content_hash: string; issued_at: string } | null;
  versions: VersionItem[];
  career_distribution: CareerDist[];
  related: RelatedProduct[];
};

export const MOCK_PRODUCTS: Record<string, ProductPageData> = {
  undercov: {
    id: "mock-prod-1",
    slug: "undercov",
    name: "언더커버",
    tagline: "프랜차이즈 점주를 위한 익명 커뮤니티와 매출 벤치마킹 서비스",
    maker_quote:
      "프차 점주 4년차, 혼자 매출 고민하다가 잠 못 잤던 밤에 만들기 시작했어요. 같은 브랜드 점주들과 솔직하게 얘기할 곳이 없어서요. 이 앱이 그 공간이 됐으면 합니다.",
    category: "saas",
    thumbnail_url: null,
    external_url: "https://undercov.kr",
    view_count: 234,
    click_count: 89,
    feedback_count: 12,
    created_at: "2026-04-23T14:30:12.000Z",
    updated_at: "2026-05-02T10:00:00.000Z",
    status: "public",
    owner_id: "mock-owner-1",
    owner_nickname: "익명 메이커",
    owner_career_tag: "3_to_5y",
    certificate: {
      registration_number: "A3F8D9",
      content_hash: "a3f8d9c2b1e4f7a2d9c3e6b8f1a4d7c2",
      issued_at: "2026-04-23T14:30:12.000Z",
    },
    versions: [
      {
        id: "v3",
        version_label: "v1.2 준비 중",
        change_note: "피드백 반영: 온보딩 단순화, 동네별 필터 추가 예정",
        version_number: 3,
        is_initial: false,
        is_future: true,
        created_at: "2026-07-01T00:00:00.000Z",
      },
      {
        id: "v2",
        version_label: "v1.1 · UI 개선 + 매출 입력 간소화",
        change_note:
          "피드백에서 가장 많이 언급된 '첫 화면 이해 어려움'을 수정했어요. 카피도 다듬었습니다.",
        version_number: 2,
        is_initial: false,
        created_at: "2026-05-02T10:00:00.000Z",
      },
      {
        id: "v1",
        version_label: "v1.0 · 최초 등록",
        change_note:
          "첫 공개. 프랜차이즈 점주 40여 분이 먼저 테스트 중이었어요. 피드백 받아가며 개선할 예정입니다.",
        version_number: 1,
        is_initial: true,
        created_at: "2026-04-23T14:30:12.000Z",
      },
    ],
    career_distribution: [
      { career_tag: "3_to_5y", label: "3~5년차", count: 5 },
      { career_tag: "under_1y", label: "1년 미만", count: 4 },
      { career_tag: "over_5y", label: "5년차 이상", count: 3 },
    ],
    related: [
      {
        slug: "sajangnim",
        name: "사장님 상담",
        tagline: "자영업자 고민 AI 상담 서비스",
        feedback_count: 7,
        hasCertificate: true,
        gradientFrom: "#D4A574",
        gradientTo: "#b88751",
        label: "자영업 AI 챗봇",
      },
      {
        slug: "review-dashboard",
        name: "리뷰 대시보드",
        tagline: "자영업자용 고객 리뷰 분석",
        feedback_count: 1,
        hasCertificate: true,
        gradientFrom: "#5B6B8A",
        gradientTo: "#3d4d6b",
        label: "리뷰 모음",
      },
    ],
  },
};

export function getMockProduct(slug: string): ProductPageData | null {
  return MOCK_PRODUCTS[slug] ?? null;
}

export function getAllMockSlugs(): string[] {
  return Object.keys(MOCK_PRODUCTS);
}
