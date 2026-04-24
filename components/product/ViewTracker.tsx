"use client";

import { useEffect } from "react";

type Props = { productId: string; slug: string };

function buildFingerprint(): string {
  const raw = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join("|");
  // 간단한 djb2 해시
  let hash = 5381;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) + hash) ^ raw.charCodeAt(i);
  }
  return (hash >>> 0).toString(36);
}

const WINDOW_MS = 24 * 60 * 60 * 1000;

export function ViewTracker({ productId, slug }: Props) {
  useEffect(() => {
    const key = `mp_view_${slug}`;
    const last = Number(localStorage.getItem(key) ?? 0);
    if (Date.now() - last < WINDOW_MS) return;

    const fingerprint = buildFingerprint();
    fetch("/api/track/view", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, fingerprint }),
    }).then(() => {
      localStorage.setItem(key, String(Date.now()));
    });
  }, [productId, slug]);

  return null;
}
