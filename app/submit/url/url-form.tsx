"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aiFillFromUrl } from "@/lib/submit/actions";
import { DRAFT_KEY } from "../_components/types";

const LOADING_STEPS = [
  "URL에 연결하는 중...",
  "페이지 정보를 읽는 중...",
  "Claude AI가 분석하는 중...",
  "14개 필드를 채우는 중...",
];

type FillFailure = { error: string };

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [userDescription, setUserDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingStep, setLoadingStep] = useState(0);
  const [failure, setFailure] = useState<FillFailure | null>(null);
  const [needsDescription, setNeedsDescription] = useState(false);
  const descriptionRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // NEEDS_DESCRIPTION 반환 시 설명 필드로 포커스
  useEffect(() => {
    if (needsDescription) descriptionRef.current?.focus();
  }, [needsDescription]);

  function doFill() {
    const trimmed = url.trim();
    if (!trimmed) { setError("URL을 입력해주세요"); return; }
    setError(null);
    setFailure(null);
    setNeedsDescription(false);
    setLoadingStep(0);

    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1);
      setLoadingStep(step);
    }, 1800);

    startTransition(async () => {
      const desc = userDescription.trim() || undefined;
      const result = await aiFillFromUrl(trimmed, desc);
      clearInterval(interval);

      const normalized = trimmed.includes("://") ? trimmed : `https://${trimmed}`;

      if (!result.ok) {
        if (result.code === "NEEDS_DESCRIPTION") {
          setNeedsDescription(true);
          return;
        }
        setFailure({ error: result.error });
        return;
      }

      sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
        submission_type: "url",
        external_url: normalized,
        name:               result.name,
        tagline:            result.tagline,
        category:           result.category,
        og_image_url:       result.thumbnailUrl,
        thumbnail_url:      null,
        thumbnail_path:     null,
        ai_failed:          false,
        target_audience:    result.target_audience,
        problem_statement:  result.problem_statement,
        solution_approach:  result.solution_approach,
        differentiator:     result.differentiator,
        product_stage:      result.product_stage,
        pricing_model:      result.pricing_model,
        feedback_categories: [],
        maker_note:         "",
        screenshot_urls:    [],
        demo_video_url:     null,
        auto_filled_fields: result.auto_filled_fields,
      }));

      router.push("/submit/step1");
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    doFill();
  }

  function handleManualEntry() {
    const trimmed = url.trim();
    const normalized = trimmed
      ? trimmed.includes("://") ? trimmed : `https://${trimmed}`
      : null;
    sessionStorage.setItem(DRAFT_KEY, JSON.stringify({
      submission_type: "url",
      external_url: normalized,
      name: "", tagline: "", category: "etc",
      thumbnail_url: null, ai_failed: true,
      target_audience: "", problem_statement: "", solution_approach: "",
      differentiator: "", product_stage: null, pricing_model: null,
      feedback_categories: [], maker_note: "",
      screenshot_urls: [], demo_video_url: null,
      auto_filled_fields: [],
    }));
    router.push("/submit/step1");
  }

  // 로딩 중
  if (isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-ink-10 border-t-accent" />
        <div>
          <p className="text-[15px] font-bold">{LOADING_STEPS[loadingStep]}</p>
          <p className="mt-1 text-[12px] text-ink-60">5~10초 소요돼요</p>
        </div>
        <ul className="text-left">
          {LOADING_STEPS.map((s, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 py-1 text-[12px] ${
                i < loadingStep ? "text-sage" : i === loadingStep ? "font-semibold text-ink" : "text-ink-40"
              }`}
            >
              {i < loadingStep ? (
                <span className="text-sage">✓</span>
              ) : i === loadingStep ? (
                <span className="animate-pulse text-accent">●</span>
              ) : (
                <span className="w-3" />
              )}
              {s}
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // AI 분석 실패 화면 (NEEDS_DESCRIPTION 외 에러)
  if (failure) {
    return (
      <div className="flex flex-1 flex-col justify-center gap-4">
        <div className="rounded-[14px] border border-amber-200 bg-amber-50 px-5 py-5">
          <p className="text-[15px] font-extrabold text-amber-700">⚠ AI 자동 분석에 실패했어요</p>
          <p className="mt-2 text-[13px] leading-relaxed text-ink-60">{failure.error}</p>
        </div>
        <button
          onClick={doFill}
          className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
        >
          다시 시도 ✨
        </button>
        <button
          onClick={handleManualEntry}
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          직접 입력하기
        </button>
      </div>
    );
  }

  // 기본 입력 폼 (NEEDS_DESCRIPTION 시 설명 필드 강조)
  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">어떤 걸 만들었어요?</h1>
      <p className="mb-6 text-[13px] text-ink-60">
        URL을 입력하면 AI가 14개 필드를 자동으로 채워드려요.
      </p>

      {/* URL */}
      <label className="mb-2 block text-[12px] font-semibold text-ink-60">제품 URL</label>
      <input
        type="text"
        placeholder="https://myproduct.kr"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(null); setNeedsDescription(false); }}
        className={`h-14 w-full rounded-[14px] border-2 bg-paper px-4 text-[14px] outline-none transition-colors focus:border-accent ${
          error ? "border-accent" : "border-ink"
        }`}
        autoFocus={!needsDescription}
      />
      {error && <p className="mt-2 text-[12px] text-accent">{error}</p>}

      {/* 한 줄 설명 */}
      <div className="mt-4">
        <label className="mb-1.5 flex items-center gap-1.5 text-[12px] font-semibold text-ink-60">
          제품 한 줄 설명
          <span className="font-normal text-ink-40">(선택)</span>
        </label>
        {needsDescription && (
          <div className="mb-2 rounded-[8px] border border-amber-200 bg-amber-50 px-3 py-2.5">
            <p className="text-[12px] font-semibold text-amber-700">이 사이트는 정보가 부족해요</p>
            <p className="mt-0.5 text-[11px] text-amber-600">
              제품 설명을 입력하면 AI가 더 잘 채워드려요.
            </p>
          </div>
        )}
        <input
          ref={descriptionRef}
          type="text"
          value={userDescription}
          onChange={(e) => setUserDescription(e.target.value)}
          placeholder="예: 프리랜서를 위한 견적서 자동 생성 서비스"
          className={`h-12 w-full rounded-[14px] border-2 bg-paper px-4 text-[13px] outline-none transition-colors focus:border-accent ${
            needsDescription ? "border-amber-400" : "border-ink-10"
          }`}
        />
        <p className="mt-1.5 text-[11px] text-ink-40">
          AI가 더 정확히 채워드려요. SPA(React/Vue)면 꼭 입력!
        </p>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <button
          type="submit"
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
        >
          AI로 자동 채우기 ✨
        </button>
        <button
          type="button"
          onClick={handleManualEntry}
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          URL 없이 직접 입력할게요
        </button>
      </div>
    </form>
  );
}
