"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { aiFillFromUrl } from "@/lib/submit/actions";

const LOADING_STEPS = [
  "URL에 연결하는 중...",
  "페이지 정보를 읽는 중...",
  "Claude AI가 분석하는 중...",
  "제품 정보를 채우는 중...",
];

export function UrlForm() {
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [loadingStep, setLoadingStep] = useState(0);
  const router = useRouter();

  function isValidUrl(v: string): boolean {
    try {
      const normalized = v.startsWith("http") ? v : `https://${v}`;
      new URL(normalized);
      return true;
    } catch {
      return false;
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) { setError("URL을 입력해주세요"); return; }
    if (!isValidUrl(trimmed)) { setError("올바른 URL 형식이 아니에요 (예: https://example.com)"); return; }

    setError(null);

    // 로딩 스텝 애니메이션
    let step = 0;
    const interval = setInterval(() => {
      step = Math.min(step + 1, LOADING_STEPS.length - 1);
      setLoadingStep(step);
    }, 1500);

    startTransition(async () => {
      const result = await aiFillFromUrl(trimmed);
      clearInterval(interval);

      if (!result.ok) {
        // AI 실패해도 수동으로 계속 진행
        sessionStorage.setItem(
          "mp_submit",
          JSON.stringify({
            submission_type: "url",
            external_url: trimmed,
            name: "",
            tagline: "",
            category: "etc",
            thumbnail_url: null,
            ai_failed: true,
            ai_error: result.error,
          }),
        );
      } else {
        sessionStorage.setItem(
          "mp_submit",
          JSON.stringify({
            submission_type: "url",
            external_url: trimmed,
            name: result.name,
            tagline: result.tagline,
            category: result.category,
            thumbnail_url: result.thumbnailUrl,
            ai_failed: false,
          }),
        );
      }
      router.push("/submit/confirm");
    });
  }

  if (isPending) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
        <div className="h-11 w-11 animate-spin rounded-full border-[3px] border-ink-10 border-t-accent" />
        <div>
          <p className="text-[15px] font-bold">
            {LOADING_STEPS[loadingStep]}
          </p>
          <p className="mt-1 text-[12px] text-ink-60">3~5초 소요돼요</p>
        </div>
        <ul className="text-left">
          {LOADING_STEPS.map((s, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 py-1 text-[12px] ${
                i < loadingStep
                  ? "text-sage"
                  : i === loadingStep
                    ? "font-semibold text-ink"
                    : "text-ink-40"
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

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col">
      <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">
        어떤 걸 만들었어요?
      </h1>
      <p className="mb-6 text-[13px] text-ink-60">
        URL을 입력하면 AI가 제품 정보를 자동으로 채워드려요.
      </p>

      <label className="mb-2 block text-[12px] font-semibold text-ink-60">
        제품 URL
      </label>
      <input
        type="text"
        placeholder="https://myproduct.kr"
        value={url}
        onChange={(e) => { setUrl(e.target.value); setError(null); }}
        className={`h-14 w-full rounded-[14px] border-2 bg-paper px-4 text-[14px] outline-none transition-colors focus:border-accent ${
          error ? "border-accent" : "border-ink"
        }`}
        autoFocus
      />

      {error && (
        <p className="mt-2 text-[12px] text-accent">{error}</p>
      )}

      <div className="mt-3 text-[11px] leading-relaxed text-ink-40">
        <strong className="text-ink-60">이런 URL 모두 가능해요:</strong>
        <br />
        랜딩페이지 · 앱스토어 · 깃허브 README · 디스퀴엇 · 블로그
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <button
          type="submit"
          className="flex h-[50px] items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
        >
          다음 →
        </button>
        <button
          type="button"
          onClick={() => router.push("/submit/manual")}
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          URL이 없어요. 직접 입력할게요
        </button>
      </div>
    </form>
  );
}
