"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { QUESTIONS, isAnswerValid, getAnswerError } from "@/lib/feedback/questions";
import type { AnswerData } from "@/lib/feedback/questions";
import { submitFeedback } from "@/lib/feedback/actions";

const TOTAL = QUESTIONS.length; // 10

type Props = {
  productId: string;
  productSlug: string;
  productName: string;
};

// ─── localStorage helpers ────────────────────────────────────────────────────

type Draft = {
  productId: string;
  startedAt: number;
  currentQ: number;
  answers: Record<number, AnswerData>;
};

function draftKey(slug: string) { return `mp_fb_${slug}`; }

function loadDraft(slug: string): Draft | null {
  try {
    const raw = localStorage.getItem(draftKey(slug));
    return raw ? (JSON.parse(raw) as Draft) : null;
  } catch { return null; }
}

function saveDraft(slug: string, draft: Draft) {
  try { localStorage.setItem(draftKey(slug), JSON.stringify(draft)); } catch {}
}

function clearDraft(slug: string) {
  try { localStorage.removeItem(draftKey(slug)); } catch {}
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function ChoiceCards({
  options, selected, onChange,
}: {
  options: readonly string[];
  selected?: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => onChange(opt)}
          className={`rounded-[14px] border px-4 py-3.5 text-left text-[14px] font-semibold transition-all ${
            selected === opt
              ? "border-ink bg-ink text-cream"
              : "border-ink-10 bg-paper text-ink hover:border-ink-40"
          }`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function ScaleButtons({
  value, onChange, hint,
}: {
  value?: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  const LABELS = ["", "😞", "😕", "😐", "🙂", "😍"];
  return (
    <div>
      {hint && <p className="mb-3 text-[11px] text-ink-40">{hint}</p>}
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            className={`flex h-12 flex-1 flex-col items-center justify-center gap-0.5 rounded-[10px] border text-xl transition-all ${
              value === n
                ? "border-ink bg-ink text-cream"
                : "border-ink-10 bg-paper hover:border-ink-40"
            }`}
          >
            <span>{LABELS[n]}</span>
            <span className="text-[10px] font-bold">{n}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Form ────────────────────────────────────────────────────────────────

export function FeedbackForm({ productId, productSlug, productName }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentQ, setCurrentQ] = useState(1);
  const [answers, setAnswers] = useState<Record<number, AnswerData>>({});
  const [startedAt, setStartedAt] = useState<number>(Date.now());
  const [saveStatus, setSaveStatus] = useState<"saved" | "unsaved">("saved");
  const [error, setError] = useState<string | null>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 마운트 시 localStorage 복원
  useEffect(() => {
    const draft = loadDraft(productSlug);
    if (draft && draft.productId === productId) {
      setAnswers(draft.answers);
      setCurrentQ(draft.currentQ);
      setStartedAt(draft.startedAt);
    } else {
      setStartedAt(Date.now());
    }
  }, [productId, productSlug]);

  // 자동 저장 (debounce 500ms)
  const scheduleSave = useCallback(
    (q: number, ans: Record<number, AnswerData>) => {
      setSaveStatus("unsaved");
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveDraft(productSlug, { productId, startedAt, currentQ: q, answers: ans });
        setSaveStatus("saved");
      }, 500);
    },
    [productId, productSlug, startedAt],
  );

  function updateAnswer(num: number, partial: Partial<AnswerData>) {
    setAnswers((prev) => {
      const next = { ...prev, [num]: { ...(prev[num] ?? {}), ...partial } };
      scheduleSave(currentQ, next);
      return next;
    });
  }

  const question = QUESTIONS[currentQ - 1];
  const currentAnswer = answers[currentQ] ?? {};
  const isValid = isAnswerValid(question, currentAnswer);
  const inlineError = getAnswerError(question, currentAnswer);

  function handleNext() {
    if (!isValid) return;
    const err = getAnswerError(question, currentAnswer);
    if (err) { setError(err); return; }
    setError(null);
    if (currentQ < TOTAL) {
      setCurrentQ((q) => q + 1);
    }
  }

  function handlePrev() {
    setError(null);
    if (currentQ > 1) setCurrentQ((q) => q - 1);
  }

  function handleSubmit() {
    // 마지막 문항 유효성
    if (!isAnswerValid(QUESTIONS[TOTAL - 1], answers[TOTAL] ?? {})) {
      setError("마지막 문항을 작성해주세요");
      return;
    }
    setError(null);

    startTransition(async () => {
      const result = await submitFeedback({
        slug: productSlug,
        answers,
        startedAt,
      });

      if (!result.ok) {
        setError(result.error);
        return;
      }

      clearDraft(productSlug);
      router.push(
        `/feedback/done?product=${encodeURIComponent(productName)}&balance=${result.newBalance}`,
      );
    });
  }

  const isLastQ = currentQ === TOTAL;

  return (
    <div className="flex flex-1 flex-col px-4 pb-8 pt-5">
      {/* 진행률 바 */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-ink-60">
            <span className="font-bold text-ink">{currentQ}</span> / {TOTAL} 문항
          </span>
          <span className={`font-medium ${saveStatus === "saved" ? "text-sage" : "text-ink-40"}`}>
            {saveStatus === "saved" ? "저장됨" : "저장 중..."}
          </span>
        </div>
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-ink-10">
          <div
            className="h-full rounded-full bg-accent transition-all duration-300"
            style={{ width: `${(currentQ / TOTAL) * 100}%` }}
          />
        </div>
      </div>

      {/* 섹션 + 문항 */}
      <div className="mb-6">
        <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-ink-40">
          {question.section}
        </p>
        <h2 className="text-[18px] font-extrabold leading-snug tracking-tight whitespace-pre-line">
          {question.question}
        </h2>
        {question.hint && (
          <p className="mt-1.5 text-[11px] text-ink-40">{question.hint}</p>
        )}
      </div>

      {/* 답변 영역 */}
      <div className="flex-1">
        {/* 객관식 */}
        {(question.type === "choice" || question.type === "choice_text") && question.options && (
          <div className="flex flex-col gap-4">
            <ChoiceCards
              options={question.options}
              selected={currentAnswer.choice}
              onChange={(v) => updateAnswer(currentQ, { choice: v })}
            />
            {question.type === "choice_text" && (
              <textarea
                value={currentAnswer.text ?? ""}
                onChange={(e) => updateAnswer(currentQ, { text: e.target.value })}
                placeholder={question.subPlaceholder}
                rows={2}
                className="w-full resize-none rounded-[8px] border border-ink-10 bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink"
              />
            )}
          </div>
        )}

        {/* 5단계 척도 */}
        {question.type === "scale_text" && (
          <div className="flex flex-col gap-4">
            <ScaleButtons
              value={currentAnswer.scale}
              onChange={(v) => updateAnswer(currentQ, { scale: v })}
              hint={question.hint}
            />
            <textarea
              value={currentAnswer.text ?? ""}
              onChange={(e) => updateAnswer(currentQ, { text: e.target.value })}
              placeholder={question.subPlaceholder}
              rows={2}
              className="w-full resize-none rounded-[8px] border border-ink-10 bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink"
            />
          </div>
        )}

        {/* 서술형 (필수/선택) */}
        {(question.type === "text" || question.type === "text_opt") && (
          <div>
            <textarea
              value={currentAnswer.text ?? ""}
              onChange={(e) => updateAnswer(currentQ, { text: e.target.value })}
              placeholder={question.placeholder}
              rows={5}
              className="w-full resize-none rounded-[8px] border border-ink-10 bg-paper p-3 text-[13px] leading-relaxed outline-none focus:border-ink"
              autoFocus
            />
            <div className="mt-1 flex items-center justify-between">
              <p className={`text-[11px] ${inlineError ? "text-accent" : "text-ink-40"}`}>
                {inlineError ?? question.hint ?? ""}
              </p>
              <p className="text-[11px] text-ink-40">
                {(currentAnswer.text ?? "").length}
                {question.minLength ? ` / ${question.minLength}+` : ""}자
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 에러 */}
      {error && (
        <div className="mt-3 rounded-[8px] bg-accent-soft px-3 py-2 text-[12px] font-semibold text-accent">
          {error}
        </div>
      )}

      {/* 이전 / 다음 버튼 */}
      <div className="mt-6 flex gap-2.5">
        {currentQ > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            className="flex h-[50px] w-20 items-center justify-center rounded-[14px] border border-ink-10 text-[13px] font-semibold text-ink-60 hover:border-ink hover:text-ink"
          >
            ← 이전
          </button>
        )}
        {isLastQ ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isPending || !isValid}
            className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-accent text-[14px] font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
          >
            {isPending ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                제출 중...
              </>
            ) : (
              "피드백 제출하기 🎉"
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={handleNext}
            disabled={!isValid}
            className="flex h-[50px] flex-1 items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90 disabled:opacity-30"
          >
            다음 →
          </button>
        )}
      </div>
    </div>
  );
}
