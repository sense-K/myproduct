// 제품 관련 공통 상수. DB CHECK 제약과 반드시 동기 유지.

// ─── 카테고리 ─────────────────────────────────────────────────────────────────

export const PRODUCT_CATEGORIES = [
  { value: "dev_tools",         label: "개발자 도구" },
  { value: "productivity",      label: "생산성 / 업무" },
  { value: "ai_data",           label: "AI / 데이터" },
  { value: "community_content", label: "커뮤니티 / 콘텐츠" },
  { value: "learning",          label: "학습 / 교육" },
  { value: "lifestyle",         label: "건강 / 라이프스타일" },
  { value: "finance_commerce",  label: "금융 / 커머스" },
  { value: "etc",               label: "기타" },
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number]["value"];
export const PRODUCT_CATEGORY_VALUES = PRODUCT_CATEGORIES.map((c) => c.value) as readonly ProductCategory[];

// ─── 제품 단계 ────────────────────────────────────────────────────────────────

export const PRODUCT_STAGES = [
  { value: "idea",      label: "아이디어" },
  { value: "prototype", label: "프로토타입" },
  { value: "beta",      label: "베타" },
  { value: "launched",  label: "출시" },
] as const;

export type ProductStage = (typeof PRODUCT_STAGES)[number]["value"];

// ─── 가격대 ───────────────────────────────────────────────────────────────────

export const PRICING_MODELS = [
  { value: "free",     label: "무료" },
  { value: "freemium", label: "프리미엄 (일부 유료)" },
  { value: "paid",     label: "유료" },
  { value: "tbd",      label: "미정" },
] as const;

export type PricingModel = (typeof PRICING_MODELS)[number]["value"];

// ─── 피드백 카테고리 ──────────────────────────────────────────────────────────

export const FEEDBACK_CATEGORIES = [
  { value: "ux_design",       label: "UX / 디자인" },
  { value: "tech",            label: "기술 구현" },
  { value: "business_model",  label: "비즈니스 모델" },
  { value: "target_fit",      label: "타겟 적합성" },
  { value: "pricing",         label: "가격" },
  { value: "marketing",       label: "마케팅" },
  { value: "other",           label: "기타" },
] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number]["value"];

// ─── 라벨 조회 유틸 ───────────────────────────────────────────────────────────

export function getCategoryLabel(value: string): string {
  return PRODUCT_CATEGORIES.find((c) => c.value === value)?.label ?? "기타";
}

export function getStageLabel(value: string | null | undefined): string {
  if (!value) return "";
  return PRODUCT_STAGES.find((s) => s.value === value)?.label ?? value;
}

export function getPricingLabel(value: string | null | undefined): string {
  if (!value) return "";
  return PRICING_MODELS.find((p) => p.value === value)?.label ?? value;
}

export function getFeedbackLabel(value: string): string {
  return FEEDBACK_CATEGORIES.find((f) => f.value === value)?.label ?? value;
}
