// 사이트 전역 SEO 상수. NEXT_PUBLIC_SITE_URL은 .env.local에서 관리.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const SITE_NAME = "마이프로덕트";

export const SITE_DESCRIPTION =
  "한국 인디 메이커를 위한 피드백 교환과 등록 증명 플랫폼. 동료의 진짜 피드백을 받고, 내 아이디어를 안전하게 공개 기록하세요.";

export const OG_IMAGE_DEFAULT = `${SITE_URL}/api/og/default`;

export const TWITTER_HANDLE = "@myproduct_kr"; // 추후 운영 계정으로 교체

// noindex 대상 경로 패턴 (robots meta + robots.txt 공유)
export const NOINDEX_PATHS = ["/me", "/submit", "/feedback", "/verify", "/api"];
