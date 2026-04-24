import Link from "next/link";
import type { NeedFeedback } from "@/lib/mock/home";

type Props = { items: NeedFeedback[] };

export function NeedFeedbackSection({ items }: Props) {
  return (
    <section className="bg-paper px-4 pb-4 pt-7 sm:px-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-[16px] font-extrabold tracking-tight">피드백 기다리는 제품</h2>
        <Link href="/feed?sort=need_feedback" className="text-[11px] text-ink-60 hover:text-ink">
          더 →
        </Link>
      </div>
      <p className="mt-1 text-[12px] text-ink-60">
        아직 피드백이 적은 작업물. 당신의 의견이 소중해요
      </p>

      <ul className="mt-4 flex flex-col gap-2.5">
        {items.map((item) => (
          <li
            key={item.slug}
            className="flex items-center gap-3 rounded-[14px] border border-dashed border-accent bg-paper p-3.5"
          >
            {/* 썸네일 */}
            <div
              className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-[8px] p-1 text-center text-[10px] font-bold text-white"
              style={{
                background: `linear-gradient(135deg, ${item.gradientFrom} 0%, ${item.gradientTo} 100%)`,
              }}
              aria-label={`${item.name} 썸네일`}
            >
              {item.label}
            </div>

            {/* 텍스트 */}
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold">{item.name}</p>
              <p className="truncate text-[11px] leading-snug text-ink-60">{item.tagline}</p>
              <p className="mt-1 text-[10px] font-semibold text-accent">
                {item.feedbackCount === 0 ? "아직 피드백 0" : `피드백 ${item.feedbackCount}개`}
                {" · "}
                {item.daysAgo === 0
                  ? "오늘 등록"
                  : item.daysAgo === 1
                    ? "어제 등록"
                    : `${item.daysAgo}일 전 등록`}
              </p>
            </div>

            {/* CTA */}
            <Link
              href={`/feedback/${item.slug}`}
              className="flex-shrink-0 rounded-full bg-ink px-3 py-1.5 text-[11px] font-bold text-cream transition-opacity hover:opacity-80"
            >
              피드백
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
