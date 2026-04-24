import Link from "next/link";

type Props = { isLoggedIn: boolean };

export function HeroSection({ isLoggedIn }: Props) {
  return (
    <section className="px-4 pb-8 pt-10 sm:px-6 sm:pt-14">
      <p className="text-4xl" role="img" aria-label="달">🌙</p>

      <h1 className="mt-4 text-[26px] font-extrabold leading-tight tracking-tight sm:text-3xl">
        만드느라<br />혼자였잖아요.
      </h1>

      <p className="mt-4 text-[14px] leading-[1.75] text-ink-60">
        이제 여기서 같이 봐줄게요.<br />
        <strong className="font-bold text-ink">
          사용자는 없어도, 피드백을 받을 동료는 있어요.
        </strong>
        <br />
        아이디어가 걱정되면, 증명서로 기록을 남기세요.
      </p>

      {/* 핵심 가치 2개 */}
      <ul className="mt-6 flex flex-col gap-3" aria-label="핵심 가치">
        <li className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-60">
          <span
            className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px] bg-accent-soft text-xs"
            aria-hidden="true"
          >
            💬
          </span>
          <span>
            <strong className="font-bold text-ink">동료 메이커들의 진짜 피드백</strong>
            <br />10문항, 익명으로 솔직하게
          </span>
        </li>
        <li className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-60">
          <span
            className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px] bg-sage-soft text-xs"
            aria-hidden="true"
          >
            🛡️
          </span>
          <span>
            <strong className="font-bold text-ink">타임스탬프 증명서로 안전하게 공개</strong>
            <br />'내가 먼저 만들었다'는 기록
          </span>
        </li>
      </ul>

      {/* CTA */}
      <div className="mt-7 flex flex-col gap-3">
        <Link
          href={isLoggedIn ? "/submit/intro" : "/login?next=/submit/intro"}
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        >
          {isLoggedIn ? "제품 올리기" : "시작하기"}
        </Link>
        <Link
          href={isLoggedIn ? "/feedback/pick" : "/login?next=/feedback/pick"}
          className="flex h-[50px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink transition-colors hover:border-ink"
        >
          피드백 주러 가기
        </Link>
      </div>
    </section>
  );
}
