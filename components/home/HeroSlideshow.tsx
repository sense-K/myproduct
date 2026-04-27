"use client";

import { useEffect, useState } from "react";

const SLIDES = [
  {
    emoji: "💬",
    title: "진짜 피드백을 받아보세요",
    subhead: '"좋아요" 말고, 무엇이 좋고 무엇을 고쳐야 하는지',
    details: [
      "4개 섹션 10문항의 구조화된 평가",
      "객관식부터 서술형까지 다양한 형식",
      "동료 메이커가 익명으로 솔직하게",
    ],
  },
  {
    emoji: "🛡️",
    title: "공개해도 안전합니다",
    subhead: "아이디어 도용 걱정 없이",
    details: [
      "등록 즉시 자동 발급되는 증명서",
      "SHA-256 해시로 시점 영구 기록",
      "외부에서도 검증 가능한 공개 레지스트리",
    ],
  },
  {
    emoji: "🔍",
    title: "다양한 작품 발견",
    subhead: "한국 인디 메이커들의 진짜 작업물",
    details: [
      "8개 카테고리로 둘러보기",
      "카드 한 장에서 핵심 파악",
      "흥미로운 작품에 직접 피드백 남기기",
    ],
  },
] as const;

export function HeroSlideshow() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  // prefers-reduced-motion 감지
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // 5초 자동 전환 (paused 또는 reducedMotion 시 정지)
  useEffect(() => {
    if (paused || reducedMotion) return;
    const id = setInterval(() => {
      setCurrent((c) => (c + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(id);
  }, [paused, reducedMotion]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-label="마이프로덕트 핵심 기능"
    >
      {/* 슬라이드 카드 — 모두 DOM에 렌더링(SEO), CSS로 현재 슬라이드만 표시 */}
      <div className="grid">
        {SLIDES.map((slide, i) => (
          <div
            key={slide.title}
            style={{ gridArea: "1 / 1" }}
            aria-hidden={i !== current}
            className={`rounded-[14px] border border-ink-10 bg-paper px-5 py-6 transition-opacity duration-500 sm:px-7 sm:py-7 ${
              i === current ? "opacity-100" : "pointer-events-none opacity-0"
            }`}
          >
            <div className="text-5xl" aria-hidden="true">{slide.emoji}</div>
            <h3 className="mt-4 text-[18px] font-extrabold leading-snug tracking-tight sm:text-[20px]">
              {slide.title}
            </h3>
            <p className="mt-1.5 text-[13px] text-ink-60">{slide.subhead}</p>
            <ul className="mt-4 flex flex-col gap-2">
              {slide.details.map((d) => (
                <li key={d} className="flex items-start gap-2 text-[13px] text-ink-60">
                  <span className="mt-0.5 flex-shrink-0 text-[10px] font-bold text-accent">●</span>
                  {d}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 점 인디케이터 */}
      <div className="mt-4 flex justify-center gap-2" role="tablist" aria-label="슬라이드 선택">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.title}
            type="button"
            role="tab"
            aria-selected={i === current}
            aria-label={`${i + 1}번 슬라이드로 이동: ${slide.title}`}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${
              i === current ? "w-6 bg-accent" : "w-2 bg-ink-10 hover:bg-ink-40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
