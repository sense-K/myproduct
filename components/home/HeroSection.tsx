import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { HeroSlideshow } from "./HeroSlideshow";

type Props = { isLoggedIn: boolean };

export function HeroSection({ isLoggedIn }: Props) {
  return (
    <section className="pb-8 pt-10 sm:pt-14">
      <Container>
        <div className="lg:grid lg:grid-cols-2 lg:items-center lg:gap-12">

          {/* 좌측: 헤드라인 + 안전 메시지 + CTA */}
          <div>
            <h1 className="text-[26px] font-extrabold leading-tight tracking-tight sm:text-3xl">
              프로젝트를 공개하고
              <br />
              다른 사람들의 피드백을 받아보세요
            </h1>

            <p className="mt-4 text-[15px] leading-relaxed text-ink-60">
              <strong className="font-bold text-accent">공개해도 안전합니다.</strong>
              <br />
              공개 즉시 발급되는 등록 증명서가 아이디어를 보호합니다.
            </p>

            <div className="mt-7 flex flex-row gap-3">
              <Link
                href={isLoggedIn ? "/submit/intro" : "/login?next=/submit/intro"}
                className="flex h-[54px] flex-1 items-center justify-center rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90"
              >
                내 프로젝트 등록하기
              </Link>
              <Link
                href="/feed"
                className="flex h-[54px] flex-1 items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink transition-colors hover:border-ink"
              >
                다른 작품 둘러보기
              </Link>
            </div>
          </div>

          {/* 우측: 슬라이드 (모바일에서는 텍스트 아래) */}
          <div className="mt-8 lg:mt-0">
            <HeroSlideshow />
          </div>

        </div>
      </Container>
    </section>
  );
}
