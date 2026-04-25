import Link from "next/link";
import { ProductCard } from "./ProductCard";
import type { HomeProduct } from "@/types/feed";
import { Container } from "@/components/layout/Container";

type Props = { products: HomeProduct[] };

export function HScrollSection({ products }: Props) {
  if (products.length === 0) return null;

  return (
    <section className="bg-cream pb-4 pt-7">
      <Container>
        <div className="flex items-baseline justify-between">
          <h2 className="text-[16px] font-extrabold tracking-tight">이번 주 피드백 많이 받은</h2>
          <Link href="/feed?sort=feedback" className="text-[11px] text-ink-60 hover:text-ink">
            더 →
          </Link>
        </div>
        <p className="mt-1 text-[12px] text-ink-60">메이커들이 자주 들여다본 작업물</p>

        <div className="scrollbar-hide -mx-4 mt-4 flex gap-2.5 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} size="lg" />
          ))}
        </div>
      </Container>
    </section>
  );
}
