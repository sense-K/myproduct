import Link from "next/link";

type Props = {
  productSlug: string;
  isOwner: boolean;
  feedbackCount: number;
};

export function StickyCta({ productSlug, isOwner, feedbackCount }: Props) {
  return (
    <div className="border-t border-ink-10 bg-paper pb-6 pt-4">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <p className="mb-2.5 text-center text-[11px] leading-relaxed text-ink-60">
        {isOwner
          ? `${feedbackCount}명이 피드백을 남겼어요. 지금 확인해보세요.`
          : "이 메이커가 당신의 피드백을 기다려요"}
      </p>
      <Link
        href={
          isOwner
            ? `/me/feedbacks-received?product=${productSlug}`
            : `/feedback/${productSlug}`
        }
        className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-accent text-[14px] font-extrabold text-white transition-opacity hover:opacity-90"
      >
        {isOwner ? `💬 피드백 ${feedbackCount}건 읽기` : "💬 피드백 작성하기"}
      </Link>
      </div>
    </div>
  );
}
