import Link from "next/link";
import { Container } from "@/components/layout/Container";

type Props = { isLoggedIn: boolean };

export function HeroSection({ isLoggedIn }: Props) {
  return (
    <section className="pb-8 pt-10 sm:pt-14">
      <Container>
      {/* H1 */}
      <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-3xl">
        프로젝트를 공개하고
        <br />
        다른 사람들의 피드백을 받아보세요
      </h1>

      {/* 서브 카피 */}
      <p className="mt-4 text-[15px] leading-relaxed text-ink-60">
        <strong className="font-bold text-accent">공개해도 안전합니다.</strong>
        <br />
        공개 즉시 발급되는 등록 증명서가 아이디어를 보호합니다.
      </p>

      {/* 작은 카피 */}
      <p className="mt-2 text-[13px] text-ink-40">
        내가 만든 프로젝트를 검증받는 공간
      </p>

      {/* 핵심 가치 2개 */}
      <ul className="mt-6 flex flex-col gap-3" aria-label="핵심 가치">
        <li className="flex items-start gap-2.5 text-[13px] leading-snug text-ink-60">
          <span
            className="mt-0.5 flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center rounded-[6px] bg-sage-soft text-xs"
            aria-hidden="true"
          >
            🛡️
          </span>
          <span>
            <strong className="font-bold text-ink">등록 즉시 증명서 자동 발급</strong>
            <br />SHA-256 해시와 타임스탬프로 만든 시점 영구 기록
          </span>
        </li>
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
      </ul>

      {/* CTA */}
      <div className="mt-7 flex flex-col gap-3">
        <Link
          href={isLoggedIn ? "/submit/intro" : "/login?next=/submit/intro"}
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90"
        >
          내 프로젝트 등록하기
        </Link>
        <Link
          href="/feed"
          className="flex h-[50px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink transition-colors hover:border-ink"
        >
          다른 작품 둘러보기
        </Link>
      </div>
      </Container>
    </section>
  );
}
