"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES } from "@/lib/constants/user";
import type { Category } from "@/lib/constants/user";
import {
  PRODUCT_STAGE_OPTIONS,
  PRICING_MODEL_OPTIONS,
  FEEDBACK_CATEGORY_OPTIONS,
  type ProductStage,
  type PricingModel,
  type FeedbackCategory,
} from "@/app/submit/_components/types";
import { updateProduct } from "@/lib/me/edit-actions";
import { SITE_NAME } from "@/lib/seo/config";

// ─── 타입 ──────────────────────────────────────────────────────────────────────

export type EditableProduct = {
  slug: string;
  name: string;
  tagline: string;
  category: string;
  external_url: string | null;
  thumbnail_url: string | null;
  target_audience: string | null;
  problem_statement: string | null;
  solution_approach: string | null;
  differentiator: string | null;
  product_stage: string | null;
  pricing_model: string | null;
  feedback_categories: string[] | null;
  maker_note: string | null;
  screenshot_urls: string[] | null;
  demo_video_url: string | null;
};

type Draft = {
  name: string;
  tagline: string;
  category: Category;
  external_url: string;
  target_audience: string;
  problem_statement: string;
  solution_approach: string;
  differentiator: string;
  product_stage: ProductStage | null;
  pricing_model: PricingModel | null;
  feedback_categories: FeedbackCategory[];
  maker_note: string;
  thumbnail_url: string | null;
  screenshot_urls: string[];
  demo_video_url: string;
};

// ─── Draft 유틸 ────────────────────────────────────────────────────────────────

function editDraftKey(slug: string) {
  return `mp_edit_${slug}`;
}

function loadDraft(slug: string): Draft | null {
  if (typeof window === "undefined") return null;
  try {
    const s = sessionStorage.getItem(editDraftKey(slug));
    return s ? (JSON.parse(s) as Draft) : null;
  } catch {
    return null;
  }
}

function saveDraft(slug: string, draft: Draft) {
  sessionStorage.setItem(editDraftKey(slug), JSON.stringify(draft));
}

function productToDraft(p: EditableProduct): Draft {
  return {
    name: p.name,
    tagline: p.tagline,
    category: p.category as Category,
    external_url: p.external_url ?? "",
    target_audience: p.target_audience ?? "",
    problem_statement: p.problem_statement ?? "",
    solution_approach: p.solution_approach ?? "",
    differentiator: p.differentiator ?? "",
    product_stage: (p.product_stage as ProductStage) ?? null,
    pricing_model: (p.pricing_model as PricingModel) ?? null,
    feedback_categories: (p.feedback_categories as FeedbackCategory[]) ?? [],
    maker_note: p.maker_note ?? "",
    thumbnail_url: p.thumbnail_url,
    screenshot_urls: p.screenshot_urls ?? [],
    demo_video_url: p.demo_video_url ?? "",
  };
}

// ─── 상수 ─────────────────────────────────────────────────────────────────────

const STEP_LABELS = ["핵심 정보", "가치 정의", "시각 자료", "선택 항목", "최종 확인"];

// ─── 메인 컴포넌트 ────────────────────────────────────────────────────────────

export function EditForm({ product }: { product: EditableProduct }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<Draft>(() => productToDraft(product));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // 첫 진입 시 sessionStorage 우선 (작성 중이던 값 보존)
  useEffect(() => {
    const saved = loadDraft(product.slug);
    if (saved) setDraft(saved);
  }, [product.slug]);

  function update(partial: Partial<Draft>) {
    setDraft((prev) => {
      const next = { ...prev, ...partial };
      saveDraft(product.slug, next);
      return next;
    });
  }

  // ─── 검증 ────────────────────────────────────────────────────────────────

  function validateStep1(): boolean {
    const e: Record<string, string> = {};
    if (draft.name.trim().length < 2) e.name = "제품명은 2자 이상 입력해주세요";
    if (draft.name.trim().length > 40) e.name = "제품명은 40자 이하로 입력해주세요";
    if (draft.tagline.trim().length < 10) e.tagline = "한 줄 소개는 10자 이상 입력해주세요";
    if (draft.tagline.trim().length > 150) e.tagline = "한 줄 소개는 150자 이하로 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function validateStep2(): boolean {
    const e: Record<string, string> = {};
    if (draft.target_audience.trim().length > 0 && draft.target_audience.trim().length < 5)
      e.audience = "5자 이상 입력해주세요";
    if (draft.problem_statement.trim().length > 0 && draft.problem_statement.trim().length < 5)
      e.problem = "5자 이상 입력해주세요";
    if (draft.solution_approach.trim().length > 0 && draft.solution_approach.trim().length < 5)
      e.solution = "5자 이상 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ─── 내비게이션 ──────────────────────────────────────────────────────────

  function goNext() {
    setErrors({});
    if (step === 1 && !validateStep1()) return;
    if (step === 2 && !validateStep2()) return;
    if (step < 5) setStep((s) => s + 1);
  }

  function goBack() {
    setErrors({});
    if (step > 1) {
      setStep((s) => s - 1);
    } else {
      router.push("/me/products");
    }
  }

  // ─── 저장 ────────────────────────────────────────────────────────────────

  function handleSave() {
    setSubmitError(null);
    startTransition(async () => {
      const trimmedUrl = draft.external_url.trim();
      const normalizedUrl = trimmedUrl
        ? trimmedUrl.includes("://")
          ? trimmedUrl
          : `https://${trimmedUrl}`
        : null;

      const result = await updateProduct(product.slug, {
        name: draft.name.trim(),
        tagline: draft.tagline.trim(),
        category: draft.category,
        external_url: normalizedUrl,
        target_audience: draft.target_audience.trim(),
        problem_statement: draft.problem_statement.trim(),
        solution_approach: draft.solution_approach.trim(),
        thumbnail_url: draft.thumbnail_url,
        screenshot_urls: draft.screenshot_urls,
        demo_video_url: draft.demo_video_url.trim() || null,
        differentiator: draft.differentiator.trim() || null,
        product_stage: draft.product_stage,
        pricing_model: draft.pricing_model,
        feedback_categories: draft.feedback_categories,
        maker_note: draft.maker_note.trim() || null,
      });

      if (!result.ok) {
        setSubmitError(result.error);
        return;
      }

      sessionStorage.removeItem(editDraftKey(product.slug));
      router.push(`/p/${product.slug}`);
    });
  }

  // ─── 공통 스타일 ─────────────────────────────────────────────────────────

  const btnBase = "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors";
  const btnOn = `${btnBase} border-ink bg-ink text-cream`;
  const btnOff = `${btnBase} border-ink-10 text-ink-60 hover:border-ink-40`;

  function fieldCls(key: string) {
    return `w-full resize-none rounded-[8px] border bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink ${
      errors[key] ? "border-accent" : "border-ink-10"
    }`;
  }

  // ─── 렌더 ────────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={goBack} className="text-sm font-semibold text-ink-60 hover:text-ink">
          ← 이전
        </button>
        <span className="text-[15px] font-extrabold tracking-tight">
          <span className="mr-1 text-accent">●</span>
          {SITE_NAME}
        </span>
        <div className="w-12" />
      </div>

      {/* 진행률 */}
      <div className="mb-6">
        <div className="mb-1.5 flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full transition-all ${
                s <= step ? "bg-accent" : "bg-ink-10"
              }`}
            />
          ))}
        </div>
        <p className="text-[11px] text-ink-40">
          {step} / 5단계 · 수정하기 · {STEP_LABELS[step - 1]}
        </p>
      </div>

      {/* ── Step 1: 핵심 정보 ── */}
      {step === 1 && (
        <>
          <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">
            기본 정보를 수정해주세요
          </h1>
          <p className="mb-6 text-[13px] text-ink-60">슬러그(URL)는 변경되지 않아요.</p>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            제품명 <span className="text-accent">*</span>
          </label>
          <input
            type="text"
            value={draft.name}
            maxLength={40}
            onChange={(e) => {
              update({ name: e.target.value });
              setErrors((p) => ({ ...p, name: "" }));
            }}
            className={`mb-1 h-11 w-full rounded-[8px] border bg-paper px-3 text-[13px] outline-none focus:border-ink ${
              errors.name ? "border-accent" : "border-ink-10"
            }`}
          />
          {errors.name && <p className="mb-1 text-[11px] text-accent">{errors.name}</p>}
          <p className="mb-4 text-right text-[11px] text-ink-40">{draft.name.length}/40</p>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            한 줄 소개 <span className="text-accent">*</span>
          </label>
          <textarea
            value={draft.tagline}
            maxLength={150}
            onChange={(e) => {
              update({ tagline: e.target.value });
              setErrors((p) => ({ ...p, tagline: "" }));
            }}
            rows={3}
            className={`mb-1 w-full resize-none rounded-[8px] border bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink ${
              errors.tagline ? "border-accent" : "border-ink-10"
            }`}
          />
          {errors.tagline && <p className="mb-1 text-[11px] text-accent">{errors.tagline}</p>}
          <p className="mb-4 text-right text-[11px] text-ink-40">{draft.tagline.length}/150</p>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            외부 링크 <span className="text-ink-40">(선택)</span>
          </label>
          <input
            type="url"
            value={draft.external_url}
            onChange={(e) => update({ external_url: e.target.value })}
            placeholder="https://example.com"
            className="mb-4 h-11 w-full rounded-[8px] border border-ink-10 bg-paper px-3 text-[13px] outline-none focus:border-ink"
          />

          <label className="mb-2 block text-[12px] font-semibold text-ink-60">
            카테고리 <span className="text-accent">*</span>
          </label>
          <div className="mb-6 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.value}
                type="button"
                onClick={() => update({ category: c.value })}
                className={draft.category === c.value ? btnOn : btnOff}
              >
                {c.label}
              </button>
            ))}
          </div>
        </>
      )}

      {/* ── Step 2: 가치 정의 ── */}
      {step === 2 && (
        <>
          <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">
            어떤 가치를 주나요?
          </h1>
          <p className="mb-6 text-[13px] text-ink-60">
            비워두면 상세 페이지에 해당 섹션이 표시되지 않아요.
          </p>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            누구를 위한 서비스인가요? <span className="text-ink-40">(선택)</span>
          </label>
          <textarea
            value={draft.target_audience}
            maxLength={200}
            onChange={(e) => {
              update({ target_audience: e.target.value });
              setErrors((p) => ({ ...p, audience: "" }));
            }}
            placeholder="혼자 사이드프로젝트를 만드는 인디 메이커. 첫 제품 공개 전 피드백이 필요한데 어디 물을 곳 없는 사람"
            rows={3}
            className={fieldCls("audience")}
          />
          {errors.audience && <p className="mb-1 text-[11px] text-accent">{errors.audience}</p>}
          <p className="mb-4 text-right text-[11px] text-ink-40">
            {draft.target_audience.length}/200
          </p>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            어떤 문제를 해결하나요? <span className="text-ink-40">(선택)</span>
          </label>
          <textarea
            value={draft.problem_statement}
            maxLength={200}
            onChange={(e) => {
              update({ problem_statement: e.target.value });
              setErrors((p) => ({ ...p, problem: "" }));
            }}
            placeholder="공개하면 아이디어 도용당할까 두려움, 어디서 피드백을 받을지 모름"
            rows={3}
            className={fieldCls("problem")}
          />
          {errors.problem && <p className="mb-1 text-[11px] text-accent">{errors.problem}</p>}
          <p className="mb-4 text-right text-[11px] text-ink-40">
            {draft.problem_statement.length}/200
          </p>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            어떻게 해결하나요? <span className="text-ink-40">(선택)</span>
          </label>
          <textarea
            value={draft.solution_approach}
            maxLength={200}
            onChange={(e) => {
              update({ solution_approach: e.target.value });
              setErrors((p) => ({ ...p, solution: "" }));
            }}
            placeholder="공개 즉시 등록 증명서 발급해 아이디어 선점 시점 인정"
            rows={3}
            className={fieldCls("solution")}
          />
          {errors.solution && <p className="mb-1 text-[11px] text-accent">{errors.solution}</p>}
          <p className="mb-4 text-right text-[11px] text-ink-40">
            {draft.solution_approach.length}/200
          </p>
        </>
      )}

      {/* ── Step 3: 시각 자료 ── */}
      {step === 3 && (
        <>
          <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">
            제품 모습을 보여주세요
          </h1>
          <p className="mb-6 text-[13px] text-ink-60">모두 선택 사항입니다.</p>

          {/* 썸네일 — 이미지 업로드 미구현 (B 작업 이후 연결) */}
          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            대표 이미지{" "}
            <span className="text-ink-40">(선택, JPG·PNG·WEBP · 최대 2MB)</span>
          </label>
          <div className="mb-6 flex aspect-video w-full flex-col items-center justify-center gap-2 rounded-[14px] border-2 border-dashed border-ink-10 bg-paper text-center">
            {draft.thumbnail_url ? (
              <img
                src={draft.thumbnail_url}
                alt="thumbnail"
                className="h-full w-full rounded-[12px] object-cover"
              />
            ) : (
              <>
                <span className="text-2xl">🖼️</span>
                <p className="text-[13px] font-semibold text-ink-60">이미지 업로드</p>
                <p className="text-[11px] text-ink-40">업로드 기능은 곧 활성화됩니다</p>
              </>
            )}
          </div>

          {/* 스크린샷 — placeholder */}
          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            스크린샷 <span className="text-ink-40">(선택, 최대 5장 · 각 5MB)</span>
          </label>
          <div className="mb-6 grid grid-cols-3 gap-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div
                key={n}
                className="flex aspect-video items-center justify-center rounded-[8px] border-2 border-dashed border-ink-10 text-ink-20"
              >
                <span className="text-[20px]">+</span>
              </div>
            ))}
          </div>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            데모 영상 URL <span className="text-ink-40">(선택, YouTube·Vimeo)</span>
          </label>
          <input
            type="url"
            value={draft.demo_video_url}
            onChange={(e) => update({ demo_video_url: e.target.value })}
            placeholder="https://youtube.com/watch?v=..."
            className="mb-4 h-11 w-full rounded-[8px] border border-ink-10 bg-paper px-3 text-[13px] outline-none focus:border-ink"
          />
        </>
      )}

      {/* ── Step 4: 선택 항목 ── */}
      {step === 4 && (
        <>
          <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">
            조금 더 알려주세요
          </h1>
          <p className="mb-6 text-[13px] text-ink-60">
            모두 선택 사항입니다. 채울수록 피드백 품질이 올라가요.
          </p>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            차별점 / 핵심 강점 <span className="text-ink-40">(선택, 200자)</span>
          </label>
          <textarea
            value={draft.differentiator}
            maxLength={200}
            onChange={(e) => update({ differentiator: e.target.value })}
            placeholder="경쟁 서비스 대비 무엇이 다른지, 어떤 강점이 있는지 한 단락으로 설명해주세요."
            rows={3}
            className="mb-1 w-full resize-none rounded-[8px] border border-ink-10 bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink"
          />
          <p className="mb-4 text-right text-[11px] text-ink-40">
            {draft.differentiator.length}/200
          </p>

          <label className="mb-2 block text-[12px] font-semibold text-ink-60">
            현재 단계 <span className="text-ink-40">(선택)</span>
          </label>
          <div className="mb-4 flex flex-wrap gap-2">
            {PRODUCT_STAGE_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() =>
                  update({ product_stage: draft.product_stage === o.value ? null : o.value })
                }
                className={draft.product_stage === o.value ? btnOn : btnOff}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-[12px] font-semibold text-ink-60">
            가격대 <span className="text-ink-40">(선택)</span>
          </label>
          <div className="mb-4 flex flex-wrap gap-2">
            {PRICING_MODEL_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() =>
                  update({ pricing_model: draft.pricing_model === o.value ? null : o.value })
                }
                className={draft.pricing_model === o.value ? btnOn : btnOff}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label className="mb-2 block text-[12px] font-semibold text-ink-60">
            받고 싶은 피드백 <span className="text-ink-40">(선택, 복수 가능)</span>
          </label>
          <div className="mb-4 flex flex-wrap gap-2">
            {FEEDBACK_CATEGORY_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  const cur = draft.feedback_categories;
                  update({
                    feedback_categories: cur.includes(o.value)
                      ? cur.filter((c) => c !== o.value)
                      : [...cur, o.value],
                  });
                }}
                className={draft.feedback_categories.includes(o.value) ? btnOn : btnOff}
              >
                {o.label}
              </button>
            ))}
          </div>

          <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
            메이커 한마디 <span className="text-ink-40">(선택, 300자)</span>
          </label>
          <textarea
            value={draft.maker_note}
            maxLength={300}
            onChange={(e) => update({ maker_note: e.target.value })}
            placeholder="왜 만들었는지, 어떤 문제를 풀고 싶었는지, 지금 어떤 피드백이 가장 필요한지 자유롭게 남겨주세요."
            rows={4}
            className="mb-1 w-full resize-none rounded-[8px] border border-ink-10 bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink"
          />
          <p className="mb-4 text-right text-[11px] text-ink-40">{draft.maker_note.length}/300</p>
        </>
      )}

      {/* ── Step 5: 최종 확인 ── */}
      {step === 5 && (
        <>
          <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">
            이렇게 수정할게요
          </h1>
          <p className="mb-4 text-[13px] text-ink-60">
            내용을 확인하고 수정이 필요하면 이전 단계로 돌아가주세요.
          </p>

          <div className="rounded-[14px] border border-ink-10 bg-paper p-4">
            <PreviewRow label="제품명" value={draft.name} onEdit={() => setStep(1)} />
            <PreviewRow label="한 줄 소개" value={draft.tagline} onEdit={() => setStep(1)} />
            <PreviewRow
              label="카테고리"
              value={CATEGORIES.find((c) => c.value === draft.category)?.label ?? draft.category}
              onEdit={() => setStep(1)}
            />
            {draft.external_url && (
              <PreviewRow label="외부 링크" value={draft.external_url} onEdit={() => setStep(1)} />
            )}
            {draft.target_audience && (
              <PreviewRow
                label="누구를 위해"
                value={draft.target_audience}
                onEdit={() => setStep(2)}
              />
            )}
            {draft.problem_statement && (
              <PreviewRow
                label="어떤 문제"
                value={draft.problem_statement}
                onEdit={() => setStep(2)}
              />
            )}
            {draft.solution_approach && (
              <PreviewRow
                label="어떻게 해결"
                value={draft.solution_approach}
                onEdit={() => setStep(2)}
              />
            )}
            {draft.demo_video_url && (
              <PreviewRow
                label="데모 영상"
                value={draft.demo_video_url}
                onEdit={() => setStep(3)}
              />
            )}
            {draft.differentiator && (
              <PreviewRow
                label="차별점"
                value={draft.differentiator}
                onEdit={() => setStep(4)}
              />
            )}
            {draft.product_stage && (
              <PreviewRow
                label="현재 단계"
                value={
                  PRODUCT_STAGE_OPTIONS.find((o) => o.value === draft.product_stage)?.label ?? ""
                }
                onEdit={() => setStep(4)}
              />
            )}
            {draft.pricing_model && (
              <PreviewRow
                label="가격대"
                value={
                  PRICING_MODEL_OPTIONS.find((o) => o.value === draft.pricing_model)?.label ?? ""
                }
                onEdit={() => setStep(4)}
              />
            )}
            {draft.feedback_categories.length > 0 && (
              <PreviewRow
                label="피드백 종류"
                value={draft.feedback_categories
                  .map((c) => FEEDBACK_CATEGORY_OPTIONS.find((o) => o.value === c)?.label)
                  .filter(Boolean)
                  .join(", ")}
                onEdit={() => setStep(4)}
              />
            )}
            {draft.maker_note && (
              <PreviewRow
                label="메이커 한마디"
                value={draft.maker_note}
                onEdit={() => setStep(4)}
              />
            )}
          </div>

          <div className="mt-4 flex gap-3 rounded-[14px] bg-ink-10 p-4">
            <span className="mt-0.5 flex-shrink-0 text-xl">ℹ️</span>
            <p className="text-[12px] leading-relaxed text-ink-60">
              수정 후에도 슬러그(URL)와 등록 증명서는 변경되지 않습니다.
            </p>
          </div>

          {submitError && (
            <div className="mt-3 rounded-[8px] bg-accent/10 px-3 py-2.5 text-[13px] font-semibold text-accent">
              {submitError}
            </div>
          )}
        </>
      )}

      {/* ─── 하단 버튼 ─── */}
      <div className="mt-auto flex flex-col gap-2.5 pb-safe pt-6">
        {step < 5 ? (
          <>
            <button
              onClick={goNext}
              className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
            >
              다음 →
            </button>
            {step === 3 && (
              <button
                onClick={() => setStep(4)}
                className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
              >
                건너뛰기
              </button>
            )}
          </>
        ) : (
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex h-[50px] w-full items-center justify-center gap-2 rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                저장 중...
              </>
            ) : (
              "수정 저장 ✓"
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── 미리보기 행 ──────────────────────────────────────────────────────────────

function PreviewRow({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-2 border-b border-ink-10 py-3 last:border-0">
      <div className="flex-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-ink-40">{label}</p>
        <div className="mt-0.5 text-[13px] text-ink">{value}</div>
      </div>
      <button
        onClick={onEdit}
        className="flex-shrink-0 text-[11px] font-semibold text-ink-40 hover:text-ink"
      >
        수정
      </button>
    </div>
  );
}
