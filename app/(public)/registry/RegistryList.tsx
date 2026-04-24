"use client";

import { useState, useEffect, useRef, useTransition } from "react";
import Link from "next/link";
import type { RegistryEntry } from "@/lib/mock/registry";

type Props = {
  initialItems: RegistryEntry[];
  initialHasMore: boolean;
  initialCursor: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function RegistryList({ initialItems, initialHasMore, initialCursor }: Props) {
  const [items, setItems] = useState(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState(initialCursor);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  async function loadMore() {
    if (!cursor || isPending) return;
    startTransition(async () => {
      const res = await fetch(`/api/registry?after=${cursor}`);
      const data = await res.json();
      setItems((prev) => [...prev, ...(data.items ?? [])]);
      setHasMore(data.hasMore);
      setCursor(data.nextCursor);
    });
  }

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadMore(); },
      { rootMargin: "200px" },
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore, cursor]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <p className="text-3xl">🛡️</p>
        <p className="text-sm font-semibold">아직 등록된 제품이 없어요</p>
        <p className="text-xs text-ink-60">첫 번째 등록자가 되어보세요</p>
        <Link href="/submit/intro" className="mt-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-cream">
          제품 등록하기
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col divide-y divide-ink-10">
        {items.map((entry) => (
          <Link
            key={entry.registration_number}
            href={`/registry/${entry.registration_number}`}
            className="flex items-start gap-3 py-4 transition-colors hover:bg-ink-10/30"
          >
            {/* 등록번호 배지 */}
            <span className="mt-0.5 flex-shrink-0 rounded-[6px] bg-ink px-2 py-0.5 font-mono text-[11px] font-bold text-cream">
              #{entry.registration_number}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[14px] font-bold leading-snug">{entry.product_name}</p>
                <span className="flex-shrink-0 text-[10px] text-ink-40">→</span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-60">{entry.tagline}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[10px] text-ink-40">
                <span>{entry.nickname}</span>
                <span>·</span>
                <span>{formatDate(entry.issued_at)}</span>
                <span>·</span>
                <span className="font-mono">{entry.hash_short}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-8" />}
      {isPending && (
        <div className="flex justify-center py-4">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-10 border-t-ink" />
        </div>
      )}
      {!hasMore && items.length > 0 && (
        <p className="mt-4 text-center text-xs text-ink-40">모든 등록 기록을 불러왔어요</p>
      )}
    </div>
  );
}
