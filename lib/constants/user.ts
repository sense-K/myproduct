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
  { value: "dev_tools",         label: "개발자 도구" },
  { value: "productivity",      label: "생산성 / 업무" },
  { value: "ai_data",           label: "AI / 데이터" },
  { value: "community_content", label: "커뮤니티 / 콘텐츠" },
  { value: "learning",          label: "학습 / 교육" },
  { value: "lifestyle",         label: "건강 / 라이프스타일" },
  { value: "finance_commerce",  label: "금융 / 커머스" },
  { value: "etc",               label: "기타" },
] as const;

export type Category = (typeof CATEGORIES)[number]["value"];
export const CATEGORY_VALUES = CATEGORIES.map((c) => c.value) as readonly Category[];

export const DEFAULT_NICKNAME = "익명 메이커";
