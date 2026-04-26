"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants/user";
import { registerProduct } from "@/lib/submit/actions";
import {
  loadDraft,
  DRAFT_KEY,
  PRODUCT_STAGE_OPTIONS,
  PRICING_MODEL_OPTIONS,
  FEEDBACK_CATEGORY_OPTIONS,
  type SubmitDraft,
} from "../_components/types";

function Row({ label, value, editStep }: { label: string; value: React.ReactNode; editStep: number }) {
  const router = useRouter();
  return (
    <div className="flex items-start justify-between gap-2 border-b border-ink-10 py-3 last:border-0">
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-40">{label}</p>
        <div className="mt-0.5 text-[13px] text-ink">{value}</div>
      </div>
      <button
        onClick={() => router.push(`/submit/step${editStep}`)}
        className="flex-shrink-0 text-[11px] font-semibold text-ink-40 hover:text-ink"
      >
        수정
      </button>
    </div>
  );
}

export function Step5Form() {
  const router = useRouter();
  const [draft, setDraft] = useState<Partial<SubmitDraft> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const d = loadDraft();
    if (!d.name) { router.replace("/submit/step1"); return; }
    setDraft(d);
  }, [router]);

  function handleSubmit() {
    if (!draft) return;
    setError(null);

    startTransition(async () => {
      const result = await registerProduct({
        name: draft.name!,
        tagline: draft.tagline!,
        maker_quote: draft.maker_note || null,
        category: draft.category!,
        external_url: draft.external_url ?? null,
        submission_type: draft.submission_type ?? "manual",
        thumbnail_url: draft.thumbnail_url ?? null,
        og_image_url: draft.og_image_url ?? null,
        target_audience: draft.target_audience ?? "",
        problem_statement: draft.problem_statement ?? "",
        solution_approach: draft.solution_approach ?? "",
        differentiator: draft.differentiator || null,
        product_stage: draft.product_stage ?? null,
        pricing_model: draft.pricing_model ?? null,
        feedback_categories: draft.feedback_categories ?? [],
        maker_note: draft.maker_note || null,
        screenshot_urls: draft.screenshot_urls ?? [],
        demo_video_url: draft.demo_video_url ?? null,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      sessionStorage.removeItem(DRAFT_KEY);
      router.push(`/submit/done?reg=${result.regNum}&slug=${result.slug}`);
    });
  }

  if (!draft) return (
    <div className="flex flex-1 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-10 border-t-ink" />
    </div>
  );

  const categoryLabel = CATEGORIES.find((c) => c.value === draft.category)?.label ?? draft.category;
  const stageLabel = PRODUCT_STAGE_OPTIONS.find((o) => o.value === draft.product_stage)?.label;
  const pricingLabel = PRICING_MODEL_OPTIONS.find((o) => o.value === draft.pricing_model)?.label;
  const catLabels = (draft.feedback_categories ?? [])
    .map((c) => FEEDBACK_CATEGORY_OPTIONS.find((o) => o.value === c)?.label)
    .filter(Boolean)
    .join(", ");

  return (
    <div className="flex flex-1 flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button
          onClick={() => router.push("/submit/step4")}
          className="text-sm font-semibold text-ink-60 hover:text-ink"
        >
          ← 이전
        </button>
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>마이프로덕트
        </span>
        <div className="w-12" />
      </div>

      {/* 진행률 */}
      <div className="mb-6">
        <div className="mb-1.5 flex gap-1">
          {[1,2,3,4,5].map((s) => (
            <div key={s} className="h-1 flex-1 rounded-full bg-accent" />
          ))}
        </div>
        <p className="text-[11px] text-ink-40">5 / 5단계 · 최종 확인</p>
      </div>

      <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">이렇게 올릴게요</h1>
      <p className="mb-4 text-[13px] text-ink-60">내용을 확인하고 수정이 필요하면 수정 버튼을 눌러주세요.</p>

      {/* 썸네일 미리보기 */}
      {(draft.thumbnail_url || draft.og_image_url) && (
        <div className="mb-4 overflow-hidden rounded-[14px]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(draft.thumbnail_url || draft.og_image_url)!}
            alt="썸네일"
            className="aspect-video w-full object-cover"
          />
          {!draft.thumbnail_url && draft.og_image_url && (
            <p className="mt-1 text-center text-[10px] text-amber-600">✨ OG 이미지 (직접 업로드로 교체 가능)</p>
          )}
        </div>
      )}

      {/* 미리보기 카드 */}
      <div className="rounded-[14px] border border-ink-10 bg-paper p-4">
        <Row label="제품명" value={draft.name} editStep={1} />
        <Row label="한 줄 소개" value={draft.tagline} editStep={1} />
        <Row label="카테고리" value={categoryLabel} editStep={1} />
        {draft.external_url && (
          <Row label="외부 링크" value={
            <a href={draft.external_url} target="_blank" rel="noopener noreferrer" className="text-accent underline">
              {draft.external_url}
            </a>
          } editStep={1} />
        )}
        <Row label="누구를 위해" value={draft.target_audience} editStep={2} />
        <Row label="어떤 문제" value={draft.problem_statement} editStep={2} />
        <Row label="어떻게 해결" value={draft.solution_approach} editStep={2} />
        {draft.demo_video_url && (
          <Row label="데모 영상" value={draft.demo_video_url} editStep={3} />
        )}
        {draft.differentiator && (
          <Row label="차별점" value={draft.differentiator} editStep={4} />
        )}
        {stageLabel && <Row label="현재 단계" value={stageLabel} editStep={4} />}
        {pricingLabel && <Row label="가격대" value={pricingLabel} editStep={4} />}
        {catLabels && <Row label="피드백 종류" value={catLabels} editStep={4} />}
        {draft.maker_note && <Row label="메이커 한마디" value={draft.maker_note} editStep={4} />}
      </div>

      {/* 증명서 안내 */}
      <div className="mt-4 flex gap-3 rounded-[14px] bg-ink p-4">
        <span className="mt-0.5 flex-shrink-0 text-2xl">🛡️</span>
        <div>
          <p className="text-[13px] font-extrabold text-cream">등록 즉시 타임스탬프 증명서 발급</p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#b5b0a5]">
            등록 시각과 내용이 SHA-256 해시로 공개 기록돼 아이디어 선점 증거가 됩니다.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-3 rounded-[8px] bg-accent-soft px-3 py-2.5 text-[13px] font-semibold text-accent">
          {error}
        </div>
      )}

      <div className="mt-4 pt-2">
        <button
          onClick={handleSubmit}
          disabled={isPending}
          className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {isPending ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              등록 중...
            </>
          ) : (
            "올리기 · 증명서 받기 🛡️"
          )}
        </button>
        <p className="mt-2 text-center text-[11px] text-ink-40">등록 즉시 공개됩니다. 신중하게 확인해주세요.</p>
      </div>
    </div>
  );
}
