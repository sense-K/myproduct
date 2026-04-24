// 홈 화면 목 데이터. DB 연동 후 이 파일은 제거하고 실 쿼리로 교체.

export type MockProduct = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  feedbackCount: number;
  hasCertificate: boolean;
  gradientFrom: string;
  gradientTo: string;
  label: string; // 썸네일 내 텍스트
};

export const MOCK_RECENT: MockProduct[] = [
  {
    slug: "undercov",
    name: "언더커버",
    tagline: "프랜차이즈 점주를 위한 익명 커뮤니티",
    category: "saas",
    feedbackCount: 12,
    hasCertificate: true,
    gradientFrom: "#2D5F3F",
    gradientTo: "#3d7a52",
    label: "undercov.kr",
  },
  {
    slug: "tax-planner",
    name: "연말정산 전략",
    tagline: "카드 최적화로 환급액 늘리기",
    category: "saas",
    feedbackCount: 8,
    hasCertificate: true,
    gradientFrom: "#D4A574",
    gradientTo: "#b88751",
    label: "연말정산 플래너",
  },
  {
    slug: "listup",
    name: "리스트업",
    tagline: "게임 리롤 계정 시세 조회 및 직거래 플랫폼",
    category: "mobile_app",
    feedbackCount: 5,
    hasCertificate: true,
    gradientFrom: "#5B6B8A",
    gradientTo: "#3d4d6b",
    label: "리스트업",
  },
  {
    slug: "sagadang-bot",
    name: "사과당 봇",
    tagline: "디저트 가게 사장이 만든 AI 레시피 추천",
    category: "etc",
    feedbackCount: 3,
    hasCertificate: true,
    gradientFrom: "#8B5A8C",
    gradientTo: "#6b3d6d",
    label: "레시피봇",
  },
  {
    slug: "gap-memo",
    name: "틈새 메모",
    tagline: "짧은 생각을 빠르게 기록하는 모바일 앱",
    category: "mobile_app",
    feedbackCount: 0,
    hasCertificate: false,
    gradientFrom: "#4A7C74",
    gradientTo: "#2e5e56",
    label: "메모앱",
  },
];

export const MOCK_TOP_FEEDBACK: MockProduct[] = [
  {
    slug: "geulbang",
    name: "글공방",
    tagline: "혼자 쓰는 글도 피드백 받자",
    category: "saas",
    feedbackCount: 24,
    hasCertificate: true,
    gradientFrom: "#C7704E",
    gradientTo: "#a05535",
    label: "AI 글쓰기 도우미",
  },
  {
    slug: "walk-diary",
    name: "걸음일기",
    tagline: "매일 걸은 길을 지도로 모아요",
    category: "mobile_app",
    feedbackCount: 18,
    hasCertificate: true,
    gradientFrom: "#4A7C74",
    gradientTo: "#2e5e56",
    label: "산책 기록",
  },
  {
    slug: "jibjoonghe",
    name: "집중해",
    tagline: "공부 타이머 + 학습 통계",
    category: "mobile_app",
    feedbackCount: 15,
    hasCertificate: true,
    gradientFrom: "#2D5F3F",
    gradientTo: "#3d7a52",
    label: "타이머 앱",
  },
];

export type NeedFeedback = {
  slug: string;
  name: string;
  tagline: string;
  feedbackCount: number;
  daysAgo: number;
  gradientFrom: string;
  gradientTo: string;
  label: string;
};

export const MOCK_NEED_FEEDBACK: NeedFeedback[] = [
  {
    slug: "gap-memo",
    name: "틈새 메모",
    tagline: "짧은 생각을 빠르게 기록하는 앱",
    feedbackCount: 0,
    daysAgo: 1,
    gradientFrom: "#D4A574",
    gradientTo: "#b88751",
    label: "메모앱",
  },
  {
    slug: "review-moa",
    name: "리뷰 모음",
    tagline: "자영업자용 고객 리뷰 대시보드",
    feedbackCount: 1,
    daysAgo: 3,
    gradientFrom: "#5B6B8A",
    gradientTo: "#3d4d6b",
    label: "리뷰 수집",
  },
];
