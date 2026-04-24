import Link from "next/link";
import type { MockProduct } from "@/lib/mock/home";

type Props = {
  product: MockProduct;
  size?: "sm" | "lg";
};

export function ProductCard({ product, size = "sm" }: Props) {
  const { slug, name, tagline, feedbackCount, hasCertificate, gradientFrom, gradientTo, label } =
    product;

  if (size === "lg") {
    return (
      <Link
        href={`/p/${slug}`}
        className="block w-44 flex-shrink-0 overflow-hidden rounded-[14px] border border-ink-10 bg-paper transition-shadow hover:shadow-md"
      >
        <div
          className="flex aspect-video items-center justify-center p-2 text-center text-xs font-bold text-white"
          style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
          aria-label={`${name} 썸네일`}
        >
          {label}
        </div>
        <div className="p-3">
          <p className="text-[13px] font-bold leading-snug">{name}</p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-ink-60">{tagline}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {hasCertificate && (
              <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[9px] font-semibold text-sage">
                🛡️ 증명
              </span>
            )}
            {feedbackCount > 0 && (
              <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-semibold text-accent">
                💬 {feedbackCount}
              </span>
            )}
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/p/${slug}`}
      className="block overflow-hidden rounded-[14px] border border-ink-10 bg-paper transition-shadow hover:shadow-md"
    >
      <div
        className="flex aspect-[4/3] items-center justify-center p-2 text-center text-xs font-bold text-white"
        style={{ background: `linear-gradient(135deg, ${gradientFrom} 0%, ${gradientTo} 100%)` }}
        aria-label={`${name} 썸네일`}
      >
        {label}
      </div>
      <div className="p-[10px]">
        <p className="text-[13px] font-bold leading-snug">{name}</p>
        <p className="mt-1 line-clamp-2 min-h-[30px] text-[11px] leading-snug text-ink-60">
          {tagline}
        </p>
        <div className="mt-2 flex flex-wrap gap-1">
          {hasCertificate && (
            <span className="rounded-full bg-sage-soft px-2 py-0.5 text-[9px] font-semibold text-sage">
              🛡️ 증명
            </span>
          )}
          {feedbackCount > 0 && (
            <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[9px] font-semibold text-accent">
              💬 {feedbackCount}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
