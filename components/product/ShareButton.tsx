"use client";

import { useState } from "react";

type Props = { title: string; url: string };

export function ShareButton({ title, url }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    if (navigator.share) {
      await navigator.share({ title, url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex-shrink-0 rounded-full border border-ink-10 px-3 py-1.5 text-xs font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
      aria-label="공유하기"
    >
      {copied ? "복사됨 ✓" : "공유"}
    </button>
  );
}
