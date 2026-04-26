"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  loadDraft,
  saveDraft,
  PRODUCT_STAGE_OPTIONS,
  PRICING_MODEL_OPTIONS,
  FEEDBACK_CATEGORY_OPTIONS,
  type ProductStage,
  type PricingModel,
  type FeedbackCategory,
} from "../_components/types";

function AiBadge() {
  return <span className="ml-1.5 text-[10px] font-medium text-amber-600">✨ AI 추측</span>;
}

export function Step4Form() {
  const router = useRouter();
  const [differentiator, setDifferentiator] = useState("");
  const [productStage, setProductStage] = useState<ProductStage | null>(null);
  const [pricingModel, setPricingModel] = useState<PricingModel | null>(null);
  const [feedbackCats, setFeedbackCats] = useState<FeedbackCategory[]>([]);
  const [makerNote, setMakerNote] = useState("");
  const [autoFilled, setAutoFilled] = useState<string[]>([]);

  useEffect(() => {
    const d = loadDraft();
    if (!d.name) { router.replace("/submit/step1"); return; }
    if (d.differentiator) setDifferentiator(d.differentiator);
    if (d.product_stage) setProductStage(d.product_stage);
    if (d.pricing_model) setPricingModel(d.pricing_model);
    if (d.feedback_categories?.length) setFeedbackCats(d.feedback_categories);
    if (d.maker_note) setMakerNote(d.maker_note);
    setAutoFilled(d.auto_filled_fields ?? []);
  }, [router]);

  function clearAutoFill(field: string) {
    setAutoFilled((prev) => {
      const next = prev.filter((f) => f !== field);
      saveDraft({ auto_filled_fields: next });
      return next;
    });
  }

  function toggleCat(cat: FeedbackCategory) {
    setFeedbackCats((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  function saveAndGo() {
    saveDraft({
      differentiator: differentiator.trim() || "",
      product_stage: productStage,
      pricing_model: pricingModel,
      feedback_categories: feedbackCats,
      maker_note: makerNote.trim(),
    });
    router.push("/submit/step5");
  }

  const btnBase = "rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors";
  const btnOn   = `${btnBase} border-ink bg-ink text-cream`;
  const btnOff  = `${btnBase} border-ink-10 text-ink-60 hover:border-ink-40`;
  const btnOnAi = `${btnBase} border-amber-400 bg-amber-50 text-amber-700`;

  return (
    <div className="flex flex-1 flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.push("/submit/step3")} className="text-sm font-semibold text-ink-60 hover:text-ink">
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
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= 4 ? "bg-accent" : "bg-ink-10"}`} />
          ))}
        </div>
        <p className="text-[11px] text-ink-40">4 / 5단계 · 선택 항목</p>
      </div>

      <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">조금 더 알려주세요</h1>
      <p className="mb-6 text-[13px] text-ink-60">모두 선택 사항입니다. 채울수록 피드백 품질이 올라가요.</p>

      {/* 차별점 */}
      <label className="mb-1.5 flex items-center text-[12px] font-semibold text-ink-60">
        차별점 / 핵심 강점 <span className="text-ink-40 ml-1">(선택, 200자)</span>
        {autoFilled.includes("differentiator") && <AiBadge />}
      </label>
      <textarea
        value={differentiator}
        maxLength={200}
        onChange={(e) => { setDifferentiator(e.target.value); clearAutoFill("differentiator"); }}
        placeholder="경쟁 서비스 대비 무엇이 다른지, 어떤 강점이 있는지 한 단락으로 설명해주세요."
        rows={3}
        className={`mb-1 w-full resize-none rounded-[8px] border bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink ${
          autoFilled.includes("differentiator") ? "border-amber-300 bg-amber-50/40" : "border-ink-10"
        }`}
      />
      <p className="mb-4 text-right text-[11px] text-ink-40">{differentiator.length}/200</p>

      {/* 현재 단계 */}
      <label className="mb-2 flex items-center text-[12px] font-semibold text-ink-60">
        현재 단계 <span className="text-ink-40 ml-1">(선택)</span>
        {autoFilled.includes("product_stage") && <AiBadge />}
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {PRODUCT_STAGE_OPTIONS.map((o) => {
          const isSelected = productStage === o.value;
          const isAi = autoFilled.includes("product_stage") && isSelected;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => { setProductStage(productStage === o.value ? null : o.value); clearAutoFill("product_stage"); }}
              className={isAi ? btnOnAi : isSelected ? btnOn : btnOff}
            >
              {o.label}{isAi ? " ✨" : ""}
            </button>
          );
        })}
      </div>

      {/* 가격대 */}
      <label className="mb-2 flex items-center text-[12px] font-semibold text-ink-60">
        가격대 <span className="text-ink-40 ml-1">(선택)</span>
        {autoFilled.includes("pricing_model") && <AiBadge />}
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {PRICING_MODEL_OPTIONS.map((o) => {
          const isSelected = pricingModel === o.value;
          const isAi = autoFilled.includes("pricing_model") && isSelected;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => { setPricingModel(pricingModel === o.value ? null : o.value); clearAutoFill("pricing_model"); }}
              className={isAi ? btnOnAi : isSelected ? btnOn : btnOff}
            >
              {o.label}{isAi ? " ✨" : ""}
            </button>
          );
        })}
      </div>

      {/* 피드백 종류 (AI 미채움 — 메이커 본인 선택) */}
      <label className="mb-2 block text-[12px] font-semibold text-ink-60">
        받고 싶은 피드백 <span className="text-ink-40">(선택, 복수 가능)</span>
      </label>
      <div className="mb-4 flex flex-wrap gap-2">
        {FEEDBACK_CATEGORY_OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => toggleCat(o.value)}
            className={feedbackCats.includes(o.value) ? btnOn : btnOff}
          >
            {o.label}
          </button>
        ))}
      </div>

      {/* 메이커 한마디 (AI 미채움 — 본인 감정) */}
      <label className="mb-1.5 block text-[12px] font-semibold text-ink-60">
        메이커 한마디 <span className="text-ink-40">(선택, 300자)</span>
      </label>
      <textarea
        value={makerNote}
        maxLength={300}
        onChange={(e) => setMakerNote(e.target.value)}
        placeholder="왜 만들었는지, 어떤 문제를 풀고 싶었는지, 지금 어떤 피드백이 가장 필요한지 자유롭게 남겨주세요."
        rows={4}
        className="mb-1 w-full resize-none rounded-[8px] border border-ink-10 bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink"
      />
      <p className="mb-4 text-right text-[11px] text-ink-40">{makerNote.length}/300</p>

      <div className="mt-auto flex flex-col gap-2.5 pt-2">
        <button
          onClick={saveAndGo}
          className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90"
        >
          다음 →
        </button>
        <button
          onClick={saveAndGo}
          className="flex h-[44px] items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 transition-colors hover:border-ink hover:text-ink"
        >
          건너뛰기 (나중에 추가)
        </button>
      </div>
    </div>
  );
}
