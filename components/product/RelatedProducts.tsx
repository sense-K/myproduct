import Link from "next/link";
import { CATEGORIES } from "@/lib/constants/user";
import type { RelatedProduct } from "@/types/product";

type Props = {
  products: RelatedProduct[];
  category: string;
};

function getCategoryLabel(value: string) {
  return CATEGORIES.find((c) => c.value === value)?.label ?? value;
}

export function RelatedProducts({ products, category }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="border-b border-ink-10 bg-paper py-6">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-ink-40">
        비슷한 분야의 제품
      </p>
      <h2 className="mb-4 text-[16px] font-extrabold tracking-tight">이런 제품도 있어요</h2>

      <div className="grid grid-cols-2 gap-2.5">
        {products.map((p) => (
          <Link
            key={p.slug}
            href={`/p/${p.slug}`}
            className="block overflow-hidden rounded-[14px] border border-ink-10 bg-paper transition-shadow hover:shadow-md"
          >
            <div
              className="flex aspect-[4/3] items-center justify-center p-2 text-center text-[11px] font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${p.gradientFrom} 0%, ${p.gradientTo} 100%)`,
              }}
              aria-label={`${p.name} 썸네일`}
            >
              {p.label}
            </div>
            <div className="p-3">
              <p className="text-[12px] font-bold">{p.name}</p>
              <p className="mt-0.5 line-clamp-2 min-h-[30px] text-[10px] leading-snug text-ink-60">
                {p.tagline}
              </p>
              <div className="mt-2 flex gap-1">
                {p.hasCertificate && (
                  <span className="rounded-full bg-sage-soft px-1.5 py-0.5 text-[9px] font-semibold text-sage">
                    🛡️
                  </span>
                )}
                {p.feedback_count > 0 && (
                  <span className="rounded-full bg-accent-soft px-1.5 py-0.5 text-[9px] font-semibold text-accent">
                    💬 {p.feedback_count}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href={`/feed?cat=${category}`}
        className="mt-4 block text-center text-[12px] font-semibold text-ink-60 hover:text-ink"
      >
        한국 인디 {getCategoryLabel(category)} 제품 더 보기 →
      </Link>
      </div>
    </section>
  );
}
