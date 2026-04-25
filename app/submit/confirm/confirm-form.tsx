"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants/user";
import type { Category } from "@/lib/constants/user";
import { registerProduct } from "@/lib/submit/actions";

type Draft = {
  submission_type: "url" | "manual";
  external_url: string | null;
  name: string;
  tagline: string;
  category: Category;
  thumbnail_url: string | null;
  ai_failed?: boolean;
  ai_error?: string;
};

export function ConfirmForm() {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [category, setCategory] = useState<Category>("etc");
  const [makerQuote, setMakerQuote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const stored = sessionStorage.getItem("mp_submit");
    if (!stored) { router.replace("/submit/url"); return; }
    const d: Draft = JSON.parse(stored);
    setDraft(d);
    setName(d.name);
    setTagline(d.tagline);
    setCategory(d.category);
  }, [router]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || name.trim().length < 2) {
      setError("제품명을 2자 이상 입력해주세요"); return;
    }
    if (!tagline.trim() || tagline.trim().length < 10) {
      setError("한 줄 소개를 10자 이상 입력해주세요"); return;
    }
    setError(null);

    startTransition(async () => {
      const result = await registerProduct({
        name: name.trim(),
        tagline: tagline.trim(),
        maker_quote: makerQuote.trim() || null,
        category,
        external_url: draft?.external_url ?? null,
        submission_type: draft?.submission_type ?? "manual",
        thumbnail_url: draft?.thumbnail_url ?? null,
      });

      if (!result.ok) { setError(result.error); return; }

      sessionStorage.removeItem("mp_submit");
      router.push(`/submit/done?reg=${result.regNum}&slug=${result.slug}`);
    });
  }

  if (!draft) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-10 border-t-ink" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col gap-4">
      <h1 className="text-[22px] font-extrabold tracking-tight">이렇게 보일 거예요</h1>
      {draft.ai_failed && (
        <div className="rounded-[8px] bg-accent-soft px-3 py-2 text-[12px] text-accent">
          AI 채움에 실패했어요. 직접 수정해주세요.
          {draft.ai_error && (
            <span className="ml-1 opacity-60">({draft.ai_error})</span>
          )}
        </div>
      )}

      {/* 프리뷰 카드 */}
      <div className="rounded-[14px] border border-ink-10 bg-paper p-4">
        {/* 썸네일 */}
        <div
          className="mb-3 flex aspect-video items-center justify-center overflow-hidden rounded-[8px] text-base font-bold text-white"
          style={{
            background: draft.thumbnail_url
              ? `url(${draft.thumbnail_url}) center/cover`
              : "linear-gradient(135deg, #2D5F3F 0%, #3d7a52 100%)",
          }}
          role="img"
          aria-label="제품 썸네일"
        >
          {!draft.thumbnail_url && name.slice(0, 8)}
          {draft.thumbnail_url && (
            <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px]">
              AI 자동
            </span>
          )}
        </div>

        {/* 제품명 */}
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ink-40">
            제품명
          </p>
          <input
            value={name}
            maxLength={40}
            onChange={(e) => { setName(e.target.value); setError(null); }}
            className="w-full border-b border-dashed border-ink-10 bg-transparent py-1 text-[15px] font-bold outline-none focus:border-ink"
          />
        </div>

        {/* 한 줄 소개 */}
        <div className="mb-3">
          <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-ink-40">
            한 줄 소개
          </p>
          <textarea
            value={tagline}
            maxLength={150}
            onChange={(e) => { setTagline(e.target.value); setError(null); }}
            rows={2}
            className="w-full resize-none border-b border-dashed border-ink-10 bg-transparent py-1 text-[13px] leading-relaxed text-ink-60 outline-none focus:border-ink"
          />
        </div>

        {/* 카테고리 */}
        <div>
          <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-40">
            카테고리
          </p>
          <div className="flex flex-wrap gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => setCategory(c.value)}
                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  category === c.value
                    ? "border-ink bg-ink text-cream"
                    : "border-ink-10 text-ink-60"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 만든 사람 한마디 (선택) */}
      <div>
        <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
          만든 사람 한마디 <span className="text-ink-40">(선택, 최대 200자)</span>
        </label>
        <textarea
          value={makerQuote}
          maxLength={200}
          onChange={(e) => setMakerQuote(e.target.value)}
          placeholder="왜 만들었는지, 어떤 문제를 풀고 싶었는지 한 마디 남겨주세요."
          rows={3}
          className="w-full resize-none rounded-[8px] border border-ink-10 bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink"
        />
        <p className="mt-1 text-right text-[11px] text-ink-40">{makerQuote.length}/200</p>
      </div>

      {/* 증명서 안내 (검정 배경) */}
      <div className="flex gap-3 rounded-[14px] bg-ink p-4">
        <span className="mt-0.5 flex-shrink-0 text-2xl" aria-hidden="true">🛡️</span>
        <div>
          <p className="text-[13px] font-extrabold text-cream">
            등록 즉시 타임스탬프 증명서가 발급돼요
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-[#b5b0a5]">
            등록 시각과 내용이 공개 기록·해시로 남아, '내가 먼저 올렸다'는 객관적 증거가
            됩니다. 법적 효력은 제한적이지만 만약의 상황에 도움이 돼요.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-[8px] bg-accent-soft px-3 py-2.5 text-[13px] font-semibold text-accent">
          {error}
        </div>
      )}

      {/* 제출 */}
      <div className="mt-auto pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              등록 중...
            </>
          ) : (
            "올리기 · 증명서 받기"
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-ink-40">
          등록 즉시 공개됩니다. 신중하게 확인해주세요.
        </p>
      </div>
    </form>
  );
}
