import Link from "next/link";
import type { CareerDist } from "@/types/product";

type Props = {
  feedbackCount: number;
  careerDistribution: CareerDist[];
  productSlug: string;
  isOwner: boolean;
};

export function FeedbackSummary({ feedbackCount, careerDistribution, productSlug, isOwner }: Props) {
  return (
    <section className="border-b border-ink-10 bg-paper px-4 py-6 sm:px-6">
      <p className="mb-4 text-[11px] font-bold uppercase tracking-widest text-ink-40">
        <span className="mr-1">💬</span> 메이커들의 검토
      </p>

      <div className="rounded-[14px] bg-gradient-to-br from-cream to-[#F5EEDD] p-5 text-center">
        <p className="text-[28px] font-extrabold tracking-tight text-accent">{feedbackCount}</p>
        <p className="mt-1 text-[13px] font-bold">명의 동료 메이커가 이 제품을 검토했어요</p>

        <p className="mt-2 text-[11px] leading-relaxed text-ink-60">
          {isOwner
            ? "상세 피드백은 마이페이지에서 확인할 수 있어요."
            : "자세한 내용은 창업자만 열람 가능해요.\n당신도 피드백을 남기면 등록권 +1을 얻어요."}
        </p>

        {careerDistribution.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-1.5">
            {careerDistribution.map((d) => (
              <span
                key={d.career_tag}
                className="rounded-full border border-ink-10 bg-paper px-2.5 py-1 text-[10px] font-semibold text-ink-60"
              >
                {d.label} · {d.count}
              </span>
            ))}
          </div>
        )}

        <Link
          href={isOwner ? `/me/feedbacks-received?product=${productSlug}` : `/feedback/${productSlug}`}
          className="mt-4 flex h-[44px] items-center justify-center rounded-[14px] bg-ink text-[13px] font-bold text-cream transition-opacity hover:opacity-90"
        >
          {isOwner ? `피드백 ${feedbackCount}건 전체 읽기 →` : "피드백 작성하고 등록권 얻기 →"}
        </Link>
      </div>
    </section>
  );
}
