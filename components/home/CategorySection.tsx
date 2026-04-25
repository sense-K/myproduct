"use client";

import { useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/user";
import { ProductCard } from "./ProductCard";
import type { HomeProduct } from "@/types/feed";

type Props = { products: HomeProduct[] };

const ALL_TAB = { value: "all", label: "전체" };
const TABS = [ALL_TAB, ...CATEGORIES.map((c) => ({ value: c.value, label: c.label }))];

export function CategorySection({ products }: Props) {
  const [active, setActive] = useState("all");

  if (products.length === 0) {
    return (
      <section className="bg-paper px-4 pb-10 pt-7 sm:px-6">
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-extrabold tracking-tight">최근 올라온 제품</h2>
        </div>
        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          <p className="text-3xl">🌱</p>
          <p className="text-[14px] font-bold text-ink">아직 등록된 제품이 없어요</p>
          <p className="text-[12px] leading-relaxed text-ink-60">
            첫 메이커가 되어보세요.
            <br />
            피드백 1개 남기면 등록권 1개를 받을 수 있어요.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
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
      </section>
    );
  }

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
