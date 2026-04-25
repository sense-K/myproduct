// 사이트 전역 SEO 상수. NEXT_PUBLIC_SITE_URL은 .env.local에서 관리.
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "http://localhost:3000";

export const SITE_NAME = "마이프로덕트";

export const SITE_DESCRIPTION =
  "프로젝트를 공개하고 다른 사람들의 피드백을 받아보세요. 공개 즉시 발급되는 등록 증명서가 아이디어를 보호합니다. 1인 개발자, 바이브코더, 인디 메이커를 위한 사이드프로젝트 검증 공간.";

export const OG_IMAGE_DEFAULT = `${SITE_URL}/api/og/default`;

export const TWITTER_HANDLE = "@myproduct_kr"; // 추후 운영 계정으로 교체

// noindex 대상 경로 패턴 (robots meta + robots.txt 공유)
export const NOINDEX_PATHS = ["/me", "/submit", "/feedback", "/verify", "/api"];
