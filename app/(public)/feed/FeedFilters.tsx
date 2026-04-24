import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/user";

const ALL_CAT = { value: "all", label: "전체" };
const CAT_TABS = [ALL_CAT, ...CATEGORIES.map((c) => ({ value: c.value, label: c.label }))];

const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "feedback", label: "피드백순" },
  { value: "views", label: "조회순" },
];

type Props = {
  currentCat: string;
  currentSort: string;
  total: number;
};

function buildHref(cat: string, sort: string, page?: number) {
  const params = new URLSearchParams();
  if (cat && cat !== "all") params.set("cat", cat);
  if (sort && sort !== "latest") params.set("sort", sort);
  if (page && page > 1) params.set("page", String(page));
  const q = params.toString();
  return `/feed${q ? `?${q}` : ""}`;
}

export function FeedFilters({ currentCat, currentSort, total }: Props) {
  return (
    <div className="sticky top-14 z-20 bg-cream/95 backdrop-blur-sm">
      {/* 카테고리 탭 */}
      <div
        className="scrollbar-hide -mx-4 flex gap-1.5 overflow-x-auto px-4 pt-4 pb-2 sm:-mx-6 sm:px-6"
        role="tablist"
        aria-label="카테고리 필터"
      >
        {CAT_TABS.map((tab) => {
          const isActive = currentCat === tab.value;
          return (
            <Link
              key={tab.value}
              href={buildHref(tab.value, currentSort)}
              role="tab"
              aria-selected={isActive}
              className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                isActive
                  ? "border-ink bg-ink text-cream"
                  : "border-ink-10 bg-paper text-ink-60 hover:border-ink-40"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      {/* 정렬 + 총 개수 */}
      <div className="flex items-center justify-between px-4 py-2 sm:px-6">
        <p className="text-[12px] text-ink-40">
          제품 <strong className="font-semibold text-ink-60">{total}</strong>개
        </p>
        <div className="flex gap-1" role="group" aria-label="정렬 옵션">
          {SORT_OPTIONS.map((s) => {
            const isActive = currentSort === s.value;
            return (
              <Link
                key={s.value}
                href={buildHref(currentCat, s.value)}
                className={`rounded-[6px] px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                  isActive
                    ? "bg-ink text-cream"
                    : "text-ink-60 hover:text-ink"
                }`}
                aria-pressed={isActive}
              >
                {s.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
