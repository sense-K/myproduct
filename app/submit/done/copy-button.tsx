"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex-shrink-0 rounded-[6px] border border-ink-10 px-2.5 py-1 text-[11px] font-semibold text-ink-60 hover:border-ink hover:text-ink"
    >
      {copied ? "복사됨 ✓" : "복사"}
    </button>
  );
}
