"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { loadMoreFeed } from "@/lib/actions/feed";
import type { FeedProduct } from "@/types/feed";

// ─── 카드 ─────────────────────────────────────────────────────────────────────

function FeedCard({ p }: { p: FeedProduct }) {
  return (
    <Link
      href={`/p/${p.slug}`}
      className="block overflow-hidden rounded-[14px] border border-ink-10 bg-paper transition-shadow hover:shadow-md"
    >
      <div
        className="flex aspect-[4/3] items-center justify-center p-2 text-center text-xs font-bold text-white sm:aspect-video"
        style={{
          background: `linear-gradient(135deg, ${p.gradientFrom} 0%, ${p.gradientTo} 100%)`,
        }}
        role="img"
        aria-label={`${p.name} 썸네일`}
      >
        {p.label}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-bold leading-snug">{p.name}</p>
        <p className="mt-1 line-clamp-2 min-h-[32px] text-[11px] leading-snug text-ink-60">
          {p.tagline}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {p.hasCertificate && (
            <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[9px] font-semibold text-sage">
              🛡️ 증명
            </span>
          )}
          {p.feedback_count > 0 && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-semibold text-accent">
              💬 {p.feedback_count}
            </span>
          )}
          {p.feedback_count === 0 && !p.hasCertificate && (
            <span className="rounded-full border border-dashed border-accent px-2 py-0.5 text-[9px] font-semibold text-accent">
              피드백 필요
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── 빈 상태 ──────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-4 py-16 text-center">
      <p className="text-4xl">🌱</p>
      <div className="space-y-2">
        <p className="text-[15px] font-bold text-ink">아직 등록된 제품이 없어요</p>
        <p className="text-[12px] leading-relaxed text-ink-60">
          첫 메이커가 되어보세요.
          <br />
          피드백 1개 남기면 등록권 1개를 받을 수 있어요.
        </p>
      </div>
      <div className="mt-2 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/feedback/pick"
          className="rounded-[8px] border border-ink px-5 py-2.5 text-[13px] font-semibold text-ink transition-opacity hover:opacity-70"
        >
          피드백 주러 가기
        </Link>
        <Link
          href="/submit/intro"
          className="rounded-[8px] bg-accent px-5 py-2.5 text-[13px] font-semibold text-white transition-opacity hover:opacity-90"
        >
          제품 등록하기
        </Link>
      </div>
    </div>
  );
}

// ─── 그리드 + 무한 스크롤 ────────────────────────────────────────────────────

type Props = {
  initialItems: FeedProduct[];
  initialHasMore: boolean;
  initialCursor: string | null;
  cat: string;
  sort: string;
};

export function FeedGrid({ initialItems, initialHasMore, initialCursor, cat, sort }: Props) {
  const [items, setItems] = useState<FeedProduct[]>(initialItems);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [isPending, startTransition] = useTransition();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setItems(initialItems);
    setHasMore(initialHasMore);
    setCursor(initialCursor);
  }, [initialItems, initialHasMore, initialCursor]);

  function loadMore() {
    if (!cursor || isPending) return;
    startTransition(async () => {
      const result = await loadMoreFeed({ cat, sort, after: cursor });
      setItems((prev) => [...prev, ...result.items]);
      setHasMore(result.hasMore);
      setCursor(result.lastCursor);
    });
  }

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, cursor, isPending]);

  if (items.length === 0) return <EmptyState />;

  return (
    <div className="px-4 pb-8 pt-3 sm:px-6">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
        {items.map((p) => (
          <FeedCard key={p.slug} p={p} />
        ))}
      </div>

      {hasMore && <div ref={sentinelRef} className="h-12" aria-hidden="true" />}

      {isPending && (
        <div className="mt-4 flex justify-center">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-ink-10 border-t-ink" />
        </div>
      )}

      {hasMore && !isPending && (
        <button
          onClick={loadMore}
          className="mt-4 hidden w-full rounded-[8px] border border-ink-10 py-3 text-sm font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink noscript-show"
        >
          더 보기
        </button>
      )}

      {!hasMore && items.length > 0 && (
        <p className="mt-6 text-center text-xs text-ink-40">모든 제품을 다 봤어요 🎉</p>
      )}
    </div>
  );
}
