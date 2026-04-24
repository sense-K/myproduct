import Link from "next/link";

type Props = { isLoggedIn: boolean };

export function FooterCta({ isLoggedIn }: Props) {
  return (
    <section className="border-t border-ink-10 bg-cream px-4 py-10 text-center sm:px-6">
      <h2 className="text-[18px] font-extrabold tracking-tight">지금 시작해볼까요?</h2>
      <p className="mt-2 text-[12px] text-ink-60">
        첫 등록 전에 다른 메이커 제품에 피드백 1개만 남겨주세요
      </p>

      <div className="mt-5 flex flex-col gap-2.5">
        <Link
          href={isLoggedIn ? "/feedback/pick" : "/login?next=/feedback/pick"}
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        >
          피드백 주러 가기
        </Link>
        <Link
          href="/about"
          className="flex h-[50px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink transition-colors hover:border-ink"
        >
          서비스 더 알아보기
        </Link>
      </div>
    </section>
  );
}
