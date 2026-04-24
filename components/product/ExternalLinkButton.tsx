"use client";

import { trackExternalLinkClick } from "@/lib/analytics/events";

type Props = {
  productId: string;
  externalUrl: string;
  displayUrl: string;
  slug?: string;
};

export function ExternalLinkButton({ productId, externalUrl, displayUrl, slug }: Props) {
  function handleClick() {
    if (slug) trackExternalLinkClick(slug);
    // 비동기 로깅 (실패해도 무시)
    fetch("/api/track/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId }),
      keepalive: true,
    });
    window.open(externalUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <button
      onClick={handleClick}
      className="flex h-[50px] w-full items-center justify-between rounded-[14px] bg-ink px-4 text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
      aria-label={`${displayUrl} 원본 사이트 새 탭으로 열기`}
    >
      <span>원본 사이트로 가기 →</span>
      <span className="font-mono text-[11px] font-medium opacity-70">{displayUrl}</span>
    </button>
  );
}
