import Link from "next/link";
import type { VersionItem } from "@/lib/mock/products";

type Props = {
  versions: VersionItem[];
  productSlug: string;
  isOwner: boolean;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric" });
}

export function Timeline({ versions, productSlug, isOwner }: Props) {
  return (
    <section className="border-b border-ink-10 bg-cream px-4 py-6 sm:px-6">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-widest text-ink-40">
        <span className="mr-1">🌱</span> 성장 기록
      </p>
      <h2 className="mb-5 text-[16px] font-extrabold tracking-tight">이 제품은 이렇게 자랐어요</h2>

      <ol className="relative pl-1">
        {versions.map((v, i) => {
          const isFuture = v.is_future;
          const isLast = i === versions.length - 1;

          return (
            <li key={v.id} className="relative pb-5 pl-7 last:pb-0">
              {/* 연결선 */}
              {!isLast && (
                <span className="absolute left-[5px] top-[18px] h-[calc(100%-14px)] w-px bg-ink-10" />
              )}
              {/* 도트 */}
              <span
                className={`absolute left-0 top-[4px] h-3 w-3 rounded-full border-2 border-cream ${
                  isFuture
                    ? "bg-paper shadow-[0_0_0_1.5px_#E8E4DB]"
                    : v.is_initial
                      ? "bg-ink-40 shadow-[0_0_0_1.5px_#858585]"
                      : "bg-accent shadow-[0_0_0_1.5px_#F04D2E]"
                }`}
              />
              <p className="text-[13px] font-extrabold leading-snug">{v.version_label}</p>
              <p className="mt-0.5 text-[10px] text-ink-40">
                {isFuture ? "예정" : formatDate(v.created_at)}
              </p>
              {v.change_note && (
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink-60">{v.change_note}</p>
              )}
            </li>
          );
        })}
      </ol>

      {isOwner && (
        <Link
          href={`/submit/version?product=${productSlug}`}
          className="mt-4 flex h-10 items-center justify-center rounded-[8px] border border-dashed border-ink-10 text-[12px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          + 새 버전 추가하기
        </Link>
      )}
    </section>
  );
}
