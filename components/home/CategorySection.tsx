"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/user";
import { ProductCard } from "./ProductCard";
import type { MockProduct } from "@/lib/mock/home";

type Props = { products: MockProduct[] };

const ALL_TAB = { value: "all", label: "전체" };
const TABS = [ALL_TAB, ...CATEGORIES.map((c) => ({ value: c.value, label: c.label }))];

export function CategorySection({ products }: Props) {
  const [active, setActive] = useState("all");

  const filtered =
    active === "all" ? products : products.filter((p) => p.category === active);

  return (
    <section className="bg-paper px-4 pb-4 pt-7 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[16px] font-extrabold tracking-tight">최근 올라온 제품</h2>
        <Link href="/feed" className="text-[11px] text-ink-60 hover:text-ink">
          전체 보기 →
        </Link>
      </div>
      <p className="mt-1 text-[12px] text-ink-60">오늘 새로 등록된 작업물들을 먼저 보여드려요</p>

      {/* 카테고리 탭 */}
      <div
        className="scrollbar-hide -mx-4 mt-4 flex gap-1.5 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6"
        role="tablist"
        aria-label="카테고리 필터"
      >
        {TABS.map((tab) => (
          <button
            key={tab.value}
            role="tab"
            aria-selected={active === tab.value}
            onClick={() => setActive(tab.value)}
            className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === tab.value
                ? "border-ink bg-ink text-cream"
                : "border-ink-10 bg-paper text-ink-60 hover:border-ink-40"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 카드 그리드 */}
      <div
        className="mt-4 grid grid-cols-2 gap-2.5 pb-4"
        role="tabpanel"
        aria-label={`${TABS.find((t) => t.value === active)?.label ?? "전체"} 제품 목록`}
      >
        {filtered.length > 0 ? (
          filtered.map((p) => <ProductCard key={p.slug} product={p} />)
        ) : (
          <p className="col-span-2 py-8 text-center text-sm text-ink-40">
            이 카테고리에는 아직 제품이 없어요.
          </p>
        )}
      </div>
    </section>
  );
}
