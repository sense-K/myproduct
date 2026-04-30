"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loadDraft, saveDraft } from "../_components/types";

function AiBadge() {
  return <span className="ml-1.5 text-[10px] font-medium text-amber-600">✨ AI 추천 — 확인 후 수정 가능</span>;
}

export function Step2Form() {
  const router = useRouter();
  const [audience, setAudience] = useState("");
  const [problem, setProblem] = useState("");
  const [solution, setSolution] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoFilled, setAutoFilled] = useState<string[]>([]);
  const [isUrlPath, setIsUrlPath] = useState(false);

  useEffect(() => {
    const d = loadDraft();
    if (!d.name) { router.replace("/submit/step1"); return; }
    if (typeof d.target_audience === "string") setAudience(d.target_audience);
    if (typeof d.problem_statement === "string") setProblem(d.problem_statement);
    if (typeof d.solution_approach === "string") setSolution(d.solution_approach);
    setAutoFilled(d.auto_filled_fields ?? []);
    // URL 경로(AI 채움)로 온 경우 3개 필드를 선택으로 처리
    setIsUrlPath(d.submission_type === "url");
  }, [router]);

  function clearAutoFill(field: string) {
    setAutoFilled((prev) => {
      const next = prev.filter((f) => f !== field);
      saveDraft({ auto_filled_fields: next });
      return next;
    });
  }

  function validate(): boolean {
    // URL 경로(AI 채움)면 빈 필드 허용 — 메이커가 검수 중 스킵 가능
    if (isUrlPath) return true;
    const e: Record<string, string> = {};
    if (audience.trim().length < 5) e.audience = "10자 이상 입력해주세요";
    if (problem.trim().length < 5) e.problem = "10자 이상 입력해주세요";
    if (solution.trim().length < 5) e.solution = "10자 이상 입력해주세요";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    saveDraft({
      target_audience: audience.trim(),
      problem_statement: problem.trim(),
      solution_approach: solution.trim(),
    });
    router.push("/submit/step3");
  }

  // URL 경로면 빈 필드도 진행 가능
  const canProceed = isUrlPath || (
    audience.trim().length >= 5 &&
    problem.trim().length >= 5 &&
    solution.trim().length >= 5
  );

  const fieldClass = (key: string, aiField: string) =>
    `w-full resize-none rounded-[8px] border p-3 text-[13px] leading-relaxed outline-none focus:border-ink ${
      autoFilled.includes(aiField)
        ? "border-amber-300 bg-amber-50 text-ink-40"
        : `bg-paper ${errors[key] ? "border-accent" : "border-ink-10"}`
    }`;

  return (
    <div className="flex flex-1 flex-col">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <button onClick={() => router.push("/submit/step1")} className="text-sm font-semibold text-ink-60 hover:text-ink">
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
            <div key={s} className={`h-1 flex-1 rounded-full ${s <= 2 ? "bg-accent" : "bg-ink-10"}`} />
          ))}
        </div>
        <p className="text-[11px] text-ink-40">2 / 5단계 · 가치 정의</p>
      </div>

      <h1 className="mb-1.5 text-[22px] font-extrabold tracking-tight">어떤 가치를 주나요?</h1>
      <p className="mb-6 text-[13px] text-ink-60">
        {isUrlPath
          ? "AI가 채운 내용을 확인·수정하거나, 비어있는 항목을 직접 작성해주세요. 모두 선택 사항이에요."
          : "피드백을 주는 메이커들이 제품을 정확히 이해할 수 있도록 3가지를 구체적으로 설명해주세요."}
      </p>

      {/* 누구를 위한 */}
      <label className="mb-1.5 flex items-center text-[12px] font-semibold text-ink-60">
        누구를 위한 서비스인가요?
        {!isUrlPath && <span className="text-accent ml-0.5">*</span>}
        {autoFilled.includes("target_audience") && <AiBadge />}
      </label>
      <textarea
        value={audience}
        maxLength={200}
        onFocus={() => clearAutoFill("target_audience")}
        onChange={(e) => { setAudience(e.target.value); setErrors((p) => ({ ...p, audience: "" })); clearAutoFill("target_audience"); }}
        placeholder="혼자 사이드프로젝트를 만드는 인디 메이커. 첫 제품 공개 전 피드백이 필요한데 어디 물을 곳 없는 사람"
        rows={3}
        className={fieldClass("audience", "target_audience")}
      />
      {errors.audience && <p className="mb-1 text-[11px] text-accent">{errors.audience}</p>}
      <p className="mb-4 text-right text-[11px] text-ink-40">{audience.length}/200</p>

      {/* 어떤 문제 */}
      <label className="mb-1.5 flex items-center text-[12px] font-semibold text-ink-60">
        어떤 문제를 해결하나요?
        {!isUrlPath && <span className="text-accent ml-0.5">*</span>}
        {autoFilled.includes("problem_statement") && <AiBadge />}
      </label>
      <textarea
        value={problem}
        maxLength={200}
        onFocus={() => clearAutoFill("problem_statement")}
        onChange={(e) => { setProblem(e.target.value); setErrors((p) => ({ ...p, problem: "" })); clearAutoFill("problem_statement"); }}
        placeholder="공개하면 아이디어 도용당할까 두려움, 어디서 피드백을 받을지 모름, 무엇을 개선해야 할지 판단이 안 섬"
        rows={3}
        className={fieldClass("problem", "problem_statement")}
      />
      {errors.problem && <p className="mb-1 text-[11px] text-accent">{errors.problem}</p>}
      <p className="mb-4 text-right text-[11px] text-ink-40">{problem.length}/200</p>

      {/* 어떻게 해결 */}
      <label className="mb-1.5 flex items-center text-[12px] font-semibold text-ink-60">
        어떻게 해결하나요?
        {!isUrlPath && <span className="text-accent ml-0.5">*</span>}
        {autoFilled.includes("solution_approach") && <AiBadge />}
      </label>
      <textarea
        value={solution}
        maxLength={200}
        onFocus={() => clearAutoFill("solution_approach")}
        onChange={(e) => { setSolution(e.target.value); setErrors((p) => ({ ...p, solution: "" })); clearAutoFill("solution_approach"); }}
        placeholder="공개 즉시 등록 증명서 발급해 아이디어 선점 시점 인정. 메이커들의 구조화된 피드백으로 개선 방향 제공"
        rows={3}
        className={fieldClass("solution", "solution_approach")}
      />
      {errors.solution && <p className="mb-1 text-[11px] text-accent">{errors.solution}</p>}
      <p className="mb-4 text-right text-[11px] text-ink-40">{solution.length}/200</p>

      <div className="mt-auto pt-2">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className="flex h-[50px] w-full items-center justify-center rounded-[14px] bg-ink text-[14px] font-bold text-cream transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          다음 →
        </button>
      </div>
    </div>
  );
}
