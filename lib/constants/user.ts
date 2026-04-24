// PRD 15.1, 15.2 — 공통 상수. DB CHECK 제약과 반드시 동기 유지.

export const CAREER_TAGS = [
  { value: "pre_founder", label: "예비 창업자", description: "아직 개발·창업 전, 기획 단계" },
  { value: "under_1y", label: "1년 미만", description: "창업 또는 제품 출시 1년 미만" },
  { value: "1_to_3y", label: "1~3년차", description: "1~3년차 메이커" },
  { value: "3_to_5y", label: "3~5년차", description: "3~5년차 메이커" },
  { value: "over_5y", label: "5년차 이상", description: "5년 이상 경력" },
] as const;

export type CareerTag = (typeof CAREER_TAGS)[number]["value"];
export const CAREER_TAG_VALUES = CAREER_TAGS.map((t) => t.value) as readonly CareerTag[];

export const CATEGORIES = [
  { value: "saas", label: "SaaS", description: "웹 기반 구독/서비스 제품" },
  { value: "mobile_app", label: "모바일앱", description: "iOS/Android 앱" },
  { value: "webtoon_creative", label: "웹툰·창작", description: "웹툰, 소설, 음악, 아트 등" },
  { value: "quirky", label: "엉뚱함", description: "쓸모는 모르겠지만 재미있는 것" },
  { value: "etc", label: "기타", description: "위 분류에 안 맞는 것" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as readonly Category[];

export const DEFAULT_NICKNAME = "익명 메이커";
