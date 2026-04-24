"use client";

// GA4 커스텀 이벤트 헬퍼 (PRD 9.9.2)
// NEXT_PUBLIC_GA_ID 없으면 조용히 skip

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean | undefined>;

function gtag(event: string, params?: EventParams) {
  if (typeof window === "undefined" || !window.gtag) return;
  window.gtag("event", event, params);
}

// ─── PRD 9.9.2 커스텀 이벤트 ────────────────────────────────────────────────

/** 제품 상세 진입 */
export function trackProductView(slug: string, category: string) {
  gtag("product_view", { slug, category });
}

/** "원본 사이트 가기" 클릭 — 핵심 전환 지표 */
export function trackExternalLinkClick(slug: string) {
  gtag("external_link_click", { slug });
}

/** 피드백 시작 (문항 폼 마운트) */
export function trackFeedbackStart(slug: string) {
  gtag("feedback_start", { slug });
}

/** 피드백 완료 제출 */
export function trackFeedbackComplete(slug: string) {
  gtag("feedback_complete", { slug });
}

/** 제품 등록 완료 */
export function trackProductSubmit(slug: string, category: string) {
  gtag("product_submit", { slug, category });
}

/** 증명서 보기/다운로드 */
export function trackCertView(registrationNumber: string) {
  gtag("cert_view", { registration_number: registrationNumber });
}

/** SNS 공유 */
export function trackShare(method: "x" | "kakao" | "copy", slug: string) {
  gtag("share", { method, slug });
}
