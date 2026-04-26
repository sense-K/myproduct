import type { Category } from "@/lib/constants/user";

export type ProductStage = "idea" | "prototype" | "beta" | "launched";
export type PricingModel = "free" | "freemium" | "paid" | "tbd";
export type FeedbackCategory =
  | "ux_design"
  | "tech"
  | "business_model"
  | "target_fit"
  | "pricing"
  | "marketing"
  | "other";

export type SubmitDraft = {
  submission_type: "manual" | "url";
  // Step 1 — 필수 핵심
  name: string;
  tagline: string;
  category: Category;
  external_url: string | null;
  thumbnail_url: string | null;
  ai_failed?: boolean;
  // Step 2 — 가치 정의 3축
  target_audience: string;
  problem_statement: string;
  solution_approach: string;
  // Step 3 — 시각 자료
  screenshot_urls: string[];
  demo_video_url: string | null;
  // Step 4 — 선택 항목
  differentiator: string;
  product_stage: ProductStage | null;
  pricing_model: PricingModel | null;
  feedback_categories: FeedbackCategory[];
  maker_note: string;
  // AI 자동 채움 메타데이터
  auto_filled_fields?: string[];
};

export const DRAFT_KEY = "mp_submit";

export function loadDraft(): Partial<SubmitDraft> {
  if (typeof window === "undefined") return {};
  try {
    const s = sessionStorage.getItem(DRAFT_KEY);
    return s ? JSON.parse(s) : {};
  } catch {
    return {};
  }
}

export function saveDraft(partial: Partial<SubmitDraft>): void {
  const cur = loadDraft();
  sessionStorage.setItem(DRAFT_KEY, JSON.stringify({ ...cur, ...partial }));
}

export const PRODUCT_STAGE_OPTIONS: { value: ProductStage; label: string }[] = [
  { value: "idea", label: "아이디어" },
  { value: "prototype", label: "프로토타입" },
  { value: "beta", label: "베타" },
  { value: "launched", label: "출시" },
];

export const PRICING_MODEL_OPTIONS: { value: PricingModel; label: string }[] = [
  { value: "free", label: "무료" },
  { value: "freemium", label: "프리미엄" },
  { value: "paid", label: "유료" },
  { value: "tbd", label: "미정" },
];

export const FEEDBACK_CATEGORY_OPTIONS: { value: FeedbackCategory; label: string }[] = [
  { value: "ux_design", label: "UX/디자인" },
  { value: "tech", label: "기술 구현" },
  { value: "business_model", label: "비즈니스 모델" },
  { value: "target_fit", label: "타겟 적합성" },
  { value: "pricing", label: "가격" },
  { value: "marketing", label: "마케팅" },
  { value: "other", label: "기타" },
];
